"""
Tests for the pipeline coordinator.

Covers:
- Plain Python coordinator execution (sequential steps)
- Non-fatal step failures (YOLO error, vision error, draft error)
- Earlier partial results preserved
- Vision review does not mutate YOLO result or lower needs_verification
- Model/fallback logging in step_log
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

from build.backend.app.pipeline.coordinator import PipelineResult, run_pipeline
from build.backend.app.services.llm.client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaResponse,
)


class TestPipelineCoordinator:
    """Pipeline coordinator tests."""

    def test_pipeline_full_success(
        self, small_test_image, sample_yolo_result, valid_vision_json, valid_advisory_json
    ):
        mock_client = MagicMock(spec=OllamaClient)

        def mock_chat(*args, **kwargs):
            if kwargs.get("is_vision"):
                return OllamaResponse(
                    content=valid_vision_json,
                    parsed_json=json.loads(valid_vision_json),
                    model="gemma3:latest",
                )
            return OllamaResponse(
                content=valid_advisory_json,
                parsed_json=json.loads(valid_advisory_json),
                model="qwen3.5:2b",
            )

        mock_client.chat.side_effect = mock_chat

        report_data = {
            "category": "pothole",
            "severity_label": "high",
            "priority_score": 80.0,
            "road_name": "Station Rd",
            "ward_name": "Ward 1",
            "zone_name": "West",
        }

        result = run_pipeline(
            image_bytes=small_test_image,
            yolo_result=sample_yolo_result,
            report_data=report_data,
            client=mock_client,
        )

        assert result.completed is True
        assert result.yolo_result == sample_yolo_result
        assert result.visual_review is not None
        assert result.visual_review["matches_category"] == "yes"
        assert result.advisory_draft is not None
        assert result.advisory_draft["source"] == "qwen"
        assert "visual_review: gemma" in result.step_log
        assert "advisory_draft: qwen" in result.step_log

    def test_pipeline_vision_unavailable_continues(
        self, small_test_image, sample_yolo_result, valid_advisory_json
    ):
        mock_client = MagicMock(spec=OllamaClient)

        def mock_chat(*args, **kwargs):
            if kwargs.get("is_vision"):
                raise OllamaConnectionError("Vision model down")
            return OllamaResponse(
                content=valid_advisory_json,
                parsed_json=json.loads(valid_advisory_json),
                model="qwen3.5:2b",
            )

        mock_client.chat.side_effect = mock_chat

        report_data = {"category": "pothole"}
        result = run_pipeline(
            image_bytes=small_test_image,
            yolo_result=sample_yolo_result,
            report_data=report_data,
            client=mock_client,
        )

        assert result.completed is True
        # Visual review used stub, step log records stub
        assert result.visual_review is not None
        assert result.visual_review["source"] == "stub"
        assert "visual_review: stub" in result.step_log
        # Advisory still succeeded
        assert result.advisory_draft["source"] == "qwen"

    def test_pipeline_all_ollama_down_uses_template_and_stubs(
        self, small_test_image, sample_yolo_result
    ):
        mock_client = MagicMock(spec=OllamaClient)
        mock_client.chat.side_effect = OllamaConnectionError("Everything down")

        report_data = {"category": "garbage", "priority_score": 45.0}
        result = run_pipeline(
            image_bytes=small_test_image,
            yolo_result=sample_yolo_result,
            report_data=report_data,
            client=mock_client,
        )

        assert result.completed is True
        assert result.visual_review["source"] == "stub"
        assert result.advisory_draft["source"] == "template"
        assert "advisory_draft: template" in result.step_log

    def test_yolo_result_cannot_be_overridden_or_lowered(
        self, small_test_image, sample_yolo_result, vision_disagrees_json, valid_advisory_json
    ):
        mock_client = MagicMock(spec=OllamaClient)

        def mock_chat(*args, **kwargs):
            if kwargs.get("is_vision"):
                return OllamaResponse(
                    content=vision_disagrees_json,
                    parsed_json=json.loads(vision_disagrees_json),
                    model="gemma3:latest",
                )
            return OllamaResponse(
                content=valid_advisory_json,
                parsed_json=json.loads(valid_advisory_json),
                model="qwen3.5:2b",
            )

        mock_client.chat.side_effect = mock_chat

        # Make sure needs_verification starts false
        yolo_in = dict(sample_yolo_result)
        yolo_in["needs_verification"] = False

        result = run_pipeline(
            image_bytes=small_test_image,
            yolo_result=yolo_in,
            report_data={"category": "pothole"},
            client=mock_client,
        )

        # Stored YOLO result must maintain category and confidence
        assert result.yolo_result["category"] == "pothole"
        assert result.yolo_result["confidence"] == sample_yolo_result["confidence"]
        assert result.yolo_result["needs_verification"] is False
        # VLM disagree is flagged separately in visual_review
        assert result.visual_review["vlm_disagrees"] is True
        assert result.visual_review["matches_category"] == "no"
