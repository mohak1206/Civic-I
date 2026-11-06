"""
Tests for deterministic template fallback.

Covers:
- Template produces exact reproducible output for identical inputs
- Proper recommendation branching based on factors (duplicate vs priority vs info)
- Mandatory disclaimer & placeholder footer present
"""

from __future__ import annotations

import sys
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.services.llm.templates import (
    ADVISORY_FOOTER,
    generate_template_draft,
)


class TestDeterministicTemplate:
    """Verify template fallback determinism and logic."""

    def test_identical_input_produces_identical_output(self, sample_draft_input_dict):
        res1 = generate_template_draft(sample_draft_input_dict)
        res2 = generate_template_draft(sample_draft_input_dict)
        assert res1 == res2
        assert res1["source"] == "template"
        assert res1["model_name"] == "template-fallback"

    def test_duplicate_recommendation_when_reports_gt_3(self, sample_draft_input_dict):
        data = sample_draft_input_dict.copy()
        data["independent_report_count"] = 5
        res = generate_template_draft(data)
        assert res["recommendation"] == "review_possible_duplicate"
        assert "Multiple independent reports (5)" in res["rationale"]

    def test_high_priority_recommendation(self, sample_draft_input_dict):
        data = sample_draft_input_dict.copy()
        data["independent_report_count"] = 1
        data["severity_label"] = "high"
        data["priority_score"] = 85.0
        res = generate_template_draft(data)
        assert res["recommendation"] == "route_for_inspection"

    def test_low_priority_requests_more_info(self, sample_draft_input_dict):
        data = sample_draft_input_dict.copy()
        data["independent_report_count"] = 1
        data["severity_label"] = "low"
        data["priority_score"] = 15.0
        res = generate_template_draft(data)
        assert res["recommendation"] == "request_more_info"

    def test_footer_present(self, sample_draft_input_dict):
        res = generate_template_draft(sample_draft_input_dict)
        assert res["disclaimer"] == ADVISORY_FOOTER
        assert "PLACEHOLDER" in res["disclaimer"]
        assert "No work order has been issued." in res["disclaimer"]
