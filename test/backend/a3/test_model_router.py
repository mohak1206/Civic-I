"""
Tests for the ModelRouter.

Covers: decision → fallback chain, vision skip on unavailable,
sequential call enforcement.
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
from build.backend.app.services.llm.model_router import ModelRouter


def _fake_response(content: str, model: str) -> OllamaResponse:
    parsed = None
    try:
        parsed = json.loads(content)
    except Exception:
        pass
    return OllamaResponse(content=content, parsed_json=parsed, model=model)


class TestModelRouterText:
    """Text routing logic."""

    def test_decision_model_succeeds(self):
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = _fake_response('{"ok": 1}', "qwen3.5:2b")

        router = ModelRouter(client=client)
        resp, source = router.route_text([ChatMessage(role="user", content="hi")])

        assert resp is not None
        assert source == "qwen"
        assert resp.model == "qwen3.5:2b"
        assert client.chat.call_count == 1

    def test_decision_fails_fallback_succeeds(self):
        client = MagicMock(spec=OllamaClient)
        # First call fails, second succeeds
        client.chat.side_effect = [
            OllamaConnectionError("qwen down"),
            _fake_response('{"ok": 2}', "llama3.2:3b"),
        ]

        router = ModelRouter(client=client)
        resp, source = router.route_text([ChatMessage(role="user", content="hi")])

        assert resp is not None
        assert source == "llama"
        assert resp.model == "llama3.2:3b"
        assert client.chat.call_count == 2

    def test_both_fail_returns_none(self):
        client = MagicMock(spec=OllamaClient)
        client.chat.side_effect = [
            OllamaConnectionError("qwen down"),
            OllamaConnectionError("llama down"),
        ]

        router = ModelRouter(client=client)
        resp, source = router.route_text([ChatMessage(role="user", content="hi")])

        assert resp is None
        assert source == "none"
        assert client.chat.call_count == 2


class TestModelRouterVision:
    """Vision routing logic."""

    def test_vision_succeeds(self):
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = _fake_response('{"desc": "ok"}', "gemma3:latest")

        router = ModelRouter(client=client)
        resp, source = router.route_vision([ChatMessage(role="user", content="see")])

        assert resp is not None
        assert source == "gemma"
        assert client.chat.call_count == 1

    def test_vision_unavailable_returns_none_and_skips(self):
        client = MagicMock(spec=OllamaClient)
        client.chat.side_effect = OllamaConnectionError("gemma down")

        router = ModelRouter(client=client)
        resp, source = router.route_vision([ChatMessage(role="user", content="see")])

        assert resp is None
        assert source == "none"
        # Vision tries only once (1 retry handled internally by client)
        assert client.chat.call_count == 1
