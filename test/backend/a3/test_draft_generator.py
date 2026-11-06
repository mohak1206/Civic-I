"""
Tests for the DraftGenerator.

Covers: valid draft generation, qwen failure → llama fallback,
both fail → template fallback, invalid JSON fallback, enum violation
fallback, forbidden-phrase fallback, footer verification.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock

import pytest

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.services.llm.client import (
    ChatMessage,
    OllamaClient,
    OllamaConnectionError,
    OllamaResponse,
)
from build.backend.app.services.llm.draft_generator import (
    DraftGenerator,
    DraftInput,
    Recommendation,
)
from build.backend.app.services.llm.model_router import ModelRouter
from build.backend.app.services.llm.templates import ADVISORY_FOOTER


def _fake_llm_response(data: dict, model: str = "qwen3.5:2b") -> OllamaResponse:
    content = json.dumps(data)
    return OllamaResponse(content=content, parsed_json=data, model=model)


class TestDraftGeneratorHappyPath:
    """Successful draft generation."""

    def test_qwen_success(self, sample_draft_input_dict, valid_advisory_json):
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = OllamaResponse(
            content=valid_advisory_json,
            parsed_json=json.loads(valid_advisory_json),
            model="qwen3.5:2b",
        )
        router = ModelRouter(client=client)
        generator = DraftGenerator(router=router)

        draft_in = DraftInput(**sample_draft_input_dict)
        result = generator.generate(draft_in)

        assert result.source == "qwen"
        assert result.recommendation == Recommendation.ROUTE_FOR_INSPECTION
        assert result.disclaimer == ADVISORY_FOOTER
        assert "PLACEHOLDER" in result.disclaimer
        assert "No work order has been issued" in result.disclaimer

    def test_footer_is_always_appended(self, sample_draft_input_dict):
        """Verify code (not the model) appends the fixed footer."""
        generator = DraftGenerator(router=ModelRouter(client=MagicMock(spec=OllamaClient)))
        # Force template by making client raise
        generator._router._client.chat.side_effect = OllamaConnectionError("down")

        draft_in = DraftInput(**sample_draft_input_dict)
        result = generator.generate(draft_in)

        assert result.disclaimer == ADVISORY_FOOTER


class TestDraftGeneratorFallbacks:
    """Fallback chains."""

    def test_qwen_fails_llama_succeeds(
        self, sample_draft_input_dict, valid_advisory_json
    ):
        client = MagicMock(spec=OllamaClient)
        # qwen fails with connection error; llama succeeds
        client.chat.side_effect = [
            OllamaConnectionError("qwen offline"),
            OllamaResponse(
                content=valid_advisory_json,
                parsed_json=json.loads(valid_advisory_json),
                model="llama3.2:3b",
            ),
        ]
        router = ModelRouter(client=client)
        generator = DraftGenerator(router=router)

        draft_in = DraftInput(**sample_draft_input_dict)
        result = generator.generate(draft_in)

        assert result.source == "llama"
        assert result.model_name == "llama3.2:3b"

    def test_both_models_fail_uses_template(self, sample_draft_input_dict):
        client = MagicMock(spec=OllamaClient)
        client.chat.side_effect = OllamaConnectionError("all down")
        router = ModelRouter(client=client)
        generator = DraftGenerator(router=router)

        draft_in = DraftInput(**sample_draft_input_dict)
        result = generator.generate(draft_in)

        assert result.source == "template"
        assert result.model_name == "template-fallback"
        assert result.disclaimer == ADVISORY_FOOTER

    def test_forbidden_phrase_triggers_fallback(
        self, sample_draft_input_dict, forbidden_phrase_json
    ):
        """When qwen outputs a forbidden phrase, it falls back."""
        client = MagicMock(spec=OllamaClient)
        valid_json = json.dumps({
            "subject": "Valid Subject",
            "body": "Valid body without forbidden phrases.",
            "requested_action": "Inspect",
            "recommendation": "route_for_inspection",
            "rationale": "Valid rationale",
        })

        # First call (qwen) produces forbidden phrase;
        # second call (llama fallback) produces valid output
        client.chat.side_effect = [
            OllamaResponse(content=forbidden_phrase_json, parsed_json={}, model="qwen3.5:2b"),
            OllamaResponse(content=valid_json, parsed_json={}, model="llama3.2:3b"),
        ]
        router = ModelRouter(client=client)
        generator = DraftGenerator(router=router)

        draft_in = DraftInput(**sample_draft_input_dict)
        result = generator.generate(draft_in)

        assert result.source == "llama"

    def test_invalid_json_triggers_template_when_all_fail(
        self, sample_draft_input_dict
    ):
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = OllamaResponse(
            content="not json", parsed_json=None, model="qwen3.5:2b"
        )
        router = ModelRouter(client=client)
        generator = DraftGenerator(router=router)

        draft_in = DraftInput(**sample_draft_input_dict)
        result = generator.generate(draft_in)

        # qwen output fails guard → tries fallback (also returns "not json") → template
        assert result.source == "template"
