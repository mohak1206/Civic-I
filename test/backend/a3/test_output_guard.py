"""
Tests for the output guard.

Covers: invalid JSON, empty JSON, non-object JSON, bad recommendation enum,
forbidden phrases (dispatch, work order, team assigned, structural findings, etc.).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.services.llm.output_guard import (
    ALLOWED_RECOMMENDATIONS,
    validate_draft_output,
)


class TestOutputGuardValid:
    """Valid outputs pass the guard."""

    @pytest.mark.parametrize("rec", sorted(ALLOWED_RECOMMENDATIONS))
    def test_all_valid_recommendations(self, rec: str):
        payload = json.dumps({
            "subject": "Valid Subject",
            "body": "Valid body text about inspection.",
            "requested_action": "Inspect area.",
            "recommendation": rec,
            "rationale": "Reason for recommendation.",
        })
        is_valid, parsed, reason = validate_draft_output(payload)
        assert is_valid is True
        assert parsed is not None
        assert parsed["recommendation"] == rec
        assert reason is None


class TestOutputGuardInvalidJson:
    """JSON syntax errors fail."""

    def test_malformed_json(self):
        is_valid, parsed, reason = validate_draft_output("not json at all")
        assert is_valid is False
        assert parsed is None
        assert "Invalid JSON" in reason

    def test_empty_string(self):
        is_valid, parsed, reason = validate_draft_output("")
        assert is_valid is False

    def test_empty_object(self):
        is_valid, parsed, reason = validate_draft_output("{}")
        assert is_valid is False
        assert "Empty" in reason

    def test_json_array(self):
        is_valid, parsed, reason = validate_draft_output("[]")
        assert is_valid is False


class TestOutputGuardEnumViolations:
    """Invalid recommendation values fail."""

    @pytest.mark.parametrize("bad_rec", [
        "deploy_team",
        "issue_work_order",
        "close_ticket",
        "high_priority",
        "",
        "ROUTE_FOR_INSPECTION",  # wrong case
    ])
    def test_invalid_recommendation(self, bad_rec: str):
        payload = json.dumps({
            "subject": "Test",
            "body": "Test",
            "requested_action": "Test",
            "recommendation": bad_rec,
            "rationale": "Test",
        })
        is_valid, parsed, reason = validate_draft_output(payload)
        assert is_valid is False
        assert "Invalid recommendation" in reason


class TestOutputGuardForbiddenPhrases:
    """Forbidden claims fail the guard."""

    @pytest.mark.parametrize("phrase", [
        "A team has been dispatched to the scene.",
        "A work order issued for immediate repair.",
        "Team assigned to handle this issue.",
        "Confirmed structural damage was observed.",
        "Confirmed depth of 15 cm.",
        "Engineering assessment confirmed the hazard.",
        "A team has been deployed.",
        "A crew has been assigned.",
        "A work order has been created.",
    ])
    def test_forbidden_phrase_rejected(self, phrase: str):
        payload = json.dumps({
            "subject": "Inspection Request",
            "body": f"Please note: {phrase}",
            "requested_action": "Inspect site",
            "recommendation": "route_for_inspection",
            "rationale": "Standard rationale",
        })
        is_valid, parsed, reason = validate_draft_output(payload)
        assert is_valid is False
        assert "Forbidden phrase detected" in reason

    def test_case_insensitive_forbidden(self):
        payload = json.dumps({
            "subject": "Inspection Request",
            "body": "WORK ORDER ISSUED immediately.",
            "requested_action": "Inspect site",
            "recommendation": "route_for_inspection",
            "rationale": "Rationale",
        })
        is_valid, parsed, reason = validate_draft_output(payload)
        assert is_valid is False
        assert "Forbidden phrase" in reason
