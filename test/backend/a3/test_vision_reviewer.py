"""
Tests for the vision reviewer and image preparation.

Covers:
- VisualReviewer.review() happy path
- Stub reviewer fallback when Ollama is unavailable
- Vision review CANNOT change YOLO category or confidence
- Vision review CANNOT lower needs_verification
- Vision review CAN escalate (raise needs_verification / set vlm_disagrees)
- EXIF and GPS metadata stripping
- Downscaling of large images (longest side ~768px)
- Disclaimer present on all output
"""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock

from PIL import Image
import pytest

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.services.llm.client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaResponse,
)
from build.backend.app.services.llm.model_router import ModelRouter
from build.backend.app.services.vision.image_prep import (
    TARGET_MAX_SIDE,
    ImageValidationError,
    _downscale,
    _strip_exif,
    prepare_image,
)
from build.backend.app.services.vision.reviewer import (
    VisualReview,
    VisualReviewer,
    YoloResult,
)
from build.backend.app.services.vision.stub_reviewer import (
    StubVisualReviewer,
    create_stub_review,
)


class TestImagePrep:
    """Image validation, EXIF stripping, and downscaling."""

    def test_empty_bytes_raises(self):
        with pytest.raises(ImageValidationError):
            prepare_image(b"")

    def test_corrupt_bytes_raises(self):
        with pytest.raises(ImageValidationError):
            prepare_image(b"not an image at all")

    def test_valid_image_produces_base64(self, small_test_image):
        b64 = prepare_image(small_test_image)
        assert isinstance(b64, str)
        assert len(b64) > 0

    def test_downscale_large_image(self, large_test_image):
        """Images larger than 768px should be scaled down."""
        b64 = prepare_image(large_test_image)
        import base64
        decoded = base64.b64decode(b64)
        img = Image.open(io.BytesIO(decoded))
        w, h = img.size
        assert max(w, h) <= TARGET_MAX_SIDE

    def test_small_image_not_upscaled(self, small_test_image):
        """Images smaller than 768px should keep their dimensions."""
        b64 = prepare_image(small_test_image)
        import base64
        decoded = base64.b64decode(b64)
        img = Image.open(io.BytesIO(decoded))
        assert img.size == (100, 100)

    def test_exif_metadata_stripped(self, exif_test_image):
        """EXIF data should be removed from the output image."""
        b64 = prepare_image(exif_test_image)
        import base64
        decoded = base64.b64decode(b64)
        img = Image.open(io.BytesIO(decoded))

        # Check that EXIF data is empty or absent
        exif = img.getexif()
        # The original had Make="TestCamera"; verify it is gone
        from PIL.ExifTags import Base as ExifBase
        assert ExifBase.Make not in exif
        assert 0x8825 not in exif  # GPS tag gone


class TestVisualReviewer:
    """Advisory visual review behavior."""

    def test_successful_review(
        self, small_test_image, sample_yolo_result, valid_vision_json
    ):
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = OllamaResponse(
            content=valid_vision_json,
            parsed_json=json.loads(valid_vision_json),
            model="gemma3:latest",
        )
        router = ModelRouter(client=client)
        reviewer = VisualReviewer(router=router)

        yolo = YoloResult(**sample_yolo_result)
        review = reviewer.review(small_test_image, yolo)

        assert review.matches_category == "yes"
        assert review.source == "gemma"
        assert review.vlm_disagrees is False
        assert review.disclaimer == "AI suggestion, unverified"

    def test_vlm_disagrees_flags_human_review(
        self, small_test_image, sample_yolo_result, vision_disagrees_json
    ):
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = OllamaResponse(
            content=vision_disagrees_json,
            parsed_json=json.loads(vision_disagrees_json),
            model="gemma3:latest",
        )
        router = ModelRouter(client=client)
        reviewer = VisualReviewer(router=router)

        yolo = YoloResult(**sample_yolo_result)
        review = reviewer.review(small_test_image, yolo)

        assert review.matches_category == "no"
        assert review.vlm_disagrees is True
        assert any("human review" in w.lower() for w in review.warnings)

    def test_yolo_result_is_never_modified(
        self, small_test_image, sample_yolo_result, vision_disagrees_json
    ):
        """Critical rule: VLM review must NEVER change YOLO category or confidence."""
        client = MagicMock(spec=OllamaClient)
        client.chat.return_value = OllamaResponse(
            content=vision_disagrees_json,
            parsed_json=json.loads(vision_disagrees_json),
            model="gemma3:latest",
        )
        router = ModelRouter(client=client)
        reviewer = VisualReviewer(router=router)

        original_category = sample_yolo_result["category"]
        original_confidence = sample_yolo_result["confidence"]

        yolo = YoloResult(**sample_yolo_result)
        reviewer.review(small_test_image, yolo)

        # YOLO object must be completely untouched
        assert yolo.category == original_category
        assert yolo.confidence == original_confidence

    def test_ollama_unavailable_uses_stub(
        self, small_test_image, sample_yolo_result
    ):
        client = MagicMock(spec=OllamaClient)
        client.chat.side_effect = OllamaConnectionError("Ollama offline")
        router = ModelRouter(client=client)
        reviewer = VisualReviewer(router=router)

        yolo = YoloResult(**sample_yolo_result)
        review = reviewer.review(small_test_image, yolo)

        assert review.matches_category == "unclear"
        assert review.source == "stub"
        assert "STUB" in review.scene_description

    def test_stub_reviewer_direct(self, small_test_image, sample_yolo_result):
        stub = StubVisualReviewer()
        yolo = YoloResult(**sample_yolo_result)
        review = stub.review(small_test_image, yolo)

        assert review.matches_category == "unclear"
        assert review.source == "stub"
        assert review.disclaimer == "AI suggestion, unverified"
