"""
Tests for privacy enforcement.

Verifies that DraftInput strictly rejects:
- reporter_name / name
- contact / email / phone
- user_id / reporter_id
- description / raw citizen free text
- any other unexpected fields (extra="forbid")
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.services.llm.draft_generator import DraftInput


class TestDraftInputPrivacy:
    """Ensure personal data and free text are rejected at model level."""

    def test_valid_input_succeeds(self, sample_draft_input_dict):
        draft_in = DraftInput(**sample_draft_input_dict)
        assert draft_in.category == "pothole"

    @pytest.mark.parametrize("forbidden_field,val", [
        ("reporter_name", "Jane Doe"),
        ("reporter_id", "usr_12345"),
        ("user_id", "usr_999"),
        ("email", "citizen@example.com"),
        ("phone", "+919876543210"),
        ("contact", "Call 555-0199"),
        ("description", "I fell into this pothole yesterday evening and my scooter broke."),
        ("raw_citizen_text", "Fix this immediately please!"),
        ("citizen_notes", "Near my house at Flat 402"),
    ])
    def test_forbidden_fields_rejected_by_pydantic(
        self, sample_draft_input_dict, forbidden_field: str, val: str
    ):
        data = sample_draft_input_dict.copy()
        data[forbidden_field] = val
        with pytest.raises(ValidationError) as exc_info:
            DraftInput(**data)
        
        # Verify that ValidationError mentions extra inputs are not permitted
        errors = exc_info.value.errors()
        assert any(e["type"] == "extra_forbidden" for e in errors)
