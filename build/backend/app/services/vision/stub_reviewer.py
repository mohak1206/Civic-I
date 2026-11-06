"""
Stub visual reviewer — used when Ollama or gemma3 is unavailable.

Returns a clearly labelled STUB review with ``matches_category="unclear"``.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from build.backend.app.services.vision.reviewer import VisualReview


def create_stub_review(reason: str = "Ollama unavailable") -> VisualReview:
    """
    Create a stub VisualReview.

    Clearly labelled as a STUB so downstream consumers know this is
    not a real VLM assessment.

    Import is deferred to avoid circular dependency with reviewer.py.
    """
    from build.backend.app.services.vision.reviewer import VisualReview

    return VisualReview(
        scene_description="STUB — Ollama unavailable. No visual review performed.",
        matches_category="unclear",
        image_quality_issues=[],
        possible_faces_or_plates=False,
        warnings=[f"STUB: {reason}"],
        vlm_disagrees=False,
        source="stub",
        disclaimer="AI suggestion, unverified",
    )


class StubVisualReviewer:
    """
    Stub reviewer that always returns an "unclear" STUB review.

    Use when Ollama is not available or gemma3 is not installed.
    """

    def review(self, image_bytes: bytes, yolo_result: object) -> VisualReview:
        """Return a stub review. Never raises."""
        return create_stub_review(reason="StubVisualReviewer — no Ollama connection")
