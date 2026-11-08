"""
Shared test fixtures for A3 tests.

All tests use mocked Ollama — no running server needed.
"""

from __future__ import annotations

import json
import sys
import os
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# ── Add project root to sys.path ──────────────────────────────────────
_PROJECT_ROOT = Path(__file__).resolve().parents[3]  # Civic-I/
_BACKEND_ROOT = _PROJECT_ROOT / "build" / "backend"

for p in (_PROJECT_ROOT, str(_BACKEND_ROOT)):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))


# ── Fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def valid_advisory_json() -> str:
    """A valid advisory JSON response from Ollama."""
    return json.dumps({
        "subject": "Inspection Request: Pothole at Station Rd",
        "body": "Dear [PLACEHOLDER AUTHORITY], a pothole has been reported.",
        "requested_action": "Inspect reported pothole at Station Rd.",
        "recommendation": "route_for_inspection",
        "rationale": "High priority, visible damage on main road.",
    })


@pytest.fixture
def invalid_recommendation_json() -> str:
    """Advisory JSON with an invalid recommendation value."""
    return json.dumps({
        "subject": "Test",
        "body": "Test body",
        "requested_action": "Test action",
        "recommendation": "deploy_immediately",
        "rationale": "Test rationale",
    })


@pytest.fixture
def forbidden_phrase_json() -> str:
    """Advisory JSON containing a forbidden phrase."""
    return json.dumps({
        "subject": "Test",
        "body": "A team has been dispatched to the location.",
        "requested_action": "Test",
        "recommendation": "route_for_inspection",
        "rationale": "Test",
    })


@pytest.fixture
def work_order_json() -> str:
    """Advisory JSON claiming a work order was issued."""
    return json.dumps({
        "subject": "Test",
        "body": "A work order issued for immediate repair.",
        "requested_action": "Test",
        "recommendation": "route_for_inspection",
        "rationale": "Test",
    })


@pytest.fixture
def valid_vision_json() -> str:
    """A valid vision review JSON response."""
    return json.dumps({
        "scene_description": "Visible crack in asphalt surface with debris.",
        "matches_category": "yes",
        "image_quality_issues": [],
        "possible_faces_or_plates": False,
        "warnings": [],
    })


@pytest.fixture
def vision_disagrees_json() -> str:
    """Vision review where VLM disagrees with YOLO."""
    return json.dumps({
        "scene_description": "Pile of mixed waste and plastic bags.",
        "matches_category": "no",
        "image_quality_issues": [],
        "possible_faces_or_plates": False,
        "warnings": [],
    })


@pytest.fixture
def sample_yolo_result() -> dict:
    """Sample YOLO result dict."""
    return {
        "category": "pothole",
        "confidence": 0.85,
        "bbox": [100, 200, 300, 400],
        "model_version": "yolov8-civic-v1",
        "needs_verification": False,
    }


@pytest.fixture
def sample_draft_input_dict() -> dict:
    """Valid DraftInput as a dict."""
    return {
        "category": "pothole",
        "severity_label": "high",
        "priority_score": 75.0,
        "priority_factors": ["main road", "high traffic"],
        "ward_name": "Ward 5",
        "zone_name": "Zone A",
        "road_name": "Station Rd",
        "independent_report_count": 2,
        "days_open": 3,
        "visual_review_summary": "Visible crack in asphalt.",
        "authority_name_placeholder": "[PLACEHOLDER AUTHORITY]",
    }


@pytest.fixture
def small_test_image() -> bytes:
    """A minimal valid JPEG image for testing."""
    from PIL import Image
    import io
    img = Image.new("RGB", (100, 100), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def large_test_image() -> bytes:
    """A JPEG image larger than 768px for downscale testing."""
    from PIL import Image
    import io
    img = Image.new("RGB", (1920, 1080), color=(64, 64, 64))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def exif_test_image() -> bytes:
    """
    A JPEG image with EXIF metadata for stripping test.

    Uses Pillow's built-in EXIF support.
    Embeds camera make and model tags to verify stripping works.
    """
    from PIL import Image
    from PIL.ExifTags import Base as ExifBase
    import io

    img = Image.new("RGB", (200, 200), color=(100, 100, 100))
    exif = img.getexif()
    exif[ExifBase.Make] = "TestCamera"
    exif[ExifBase.Model] = "TestModel"

    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif)
    return buf.getvalue()
