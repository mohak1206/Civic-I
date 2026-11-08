"""
Advisory visual reviewer using gemma3 via Ollama.

Produces a VisualReview that is strictly advisory:
- May ESCALATE (set vlm_disagrees, raise needs_verification).
- Must NEVER change the YOLO category or confidence.
- Must NEVER lower needs_verification.

Prompt rules:
- Describe only what is visible.
- Forbid statements about depth, structural safety, severity in
  engineering terms, underground drains, identifying people, or
  reading plates.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Literal

from pydantic import BaseModel, Field

from build.backend.app.services.llm.client import ChatMessage, OllamaClient
from build.backend.app.services.llm.model_router import ModelRouter
from build.backend.app.services.vision.image_prep import (
    ImageValidationError,
    prepare_image,
)
from build.backend.app.services.vision.stub_reviewer import (
    StubVisualReviewer,
    create_stub_review,
)

logger = logging.getLogger(__name__)


# ── Data model ──────────────────────────────────────────────────────────────

class VisualReview(BaseModel):
    """Result of a VLM visual review.  Advisory only."""

    scene_description: str = ""
    matches_category: Literal["yes", "no", "unclear"] = "unclear"
    image_quality_issues: list[str] = Field(default_factory=list)
    possible_faces_or_plates: bool = False
    warnings: list[str] = Field(default_factory=list)
    vlm_disagrees: bool = False
    source: str = "gemma"
    disclaimer: str = "AI suggestion, unverified"


class YoloResult(BaseModel):
    """YOLO prediction result — the fixed contract that must not change."""

    category: str
    confidence: float
    bbox: list[float] | None = None
    model_version: str = ""
    needs_verification: bool = False


# ── Prompt ──────────────────────────────────────────────────────────────────

_VISION_SYSTEM_PROMPT = """\
You are reviewing a photograph of a reported civic issue.
Describe ONLY what is visible in the image.

STRICT RULES:
- Describe visible surface features only (e.g. cracks, debris, discoloration).
- Do NOT make statements about depth, structural safety, severity in engineering terms, or the state of underground drains.
- Do NOT identify people or read license plates.
- Do NOT speculate about causes or consequences.
- Keep the description short (2-3 sentences maximum).

Answer ONLY in JSON with these fields:
- scene_description: short description of what is visible
- matches_category: "yes" if the image looks like {category}, "no" if it clearly does not, "unclear" if unsure
- image_quality_issues: list of issues like "blurry", "dark", "too far", "partially obstructed" (empty list if none)
- possible_faces_or_plates: true if faces or license plates might be visible, false otherwise
- warnings: list of any concerns (empty list if none)
"""

_VISION_OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "scene_description": {"type": "string"},
        "matches_category": {
            "type": "string",
            "enum": ["yes", "no", "unclear"],
        },
        "image_quality_issues": {
            "type": "array",
            "items": {"type": "string"},
        },
        "possible_faces_or_plates": {"type": "boolean"},
        "warnings": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": [
        "scene_description",
        "matches_category",
        "image_quality_issues",
        "possible_faces_or_plates",
        "warnings",
    ],
}


# ── Reviewer ────────────────────────────────────────────────────────────────

class VisualReviewer:
    """
    Advisory visual reviewer using gemma3.

    Parameters
    ----------
    router : ModelRouter, optional
        Pre-configured model router.
    """

    def __init__(self, router: ModelRouter | None = None) -> None:
        self._router = router or ModelRouter()

    def review(
        self,
        image_bytes: bytes,
        yolo_result: YoloResult,
    ) -> VisualReview:
        """
        Review an image against a YOLO classification result.

        This is advisory only.  It may ESCALATE (set vlm_disagrees
        or raise needs_verification) but never changes category,
        confidence, or lowers needs_verification.

        Falls to a stub review if Ollama or the model is unavailable.

        Never raises.
        """
        # --- Prepare image ---
        try:
            image_b64 = prepare_image(image_bytes)
        except ImageValidationError as exc:
            logger.warning("Image preparation failed: %s — using stub", exc)
            return create_stub_review(
                reason=f"Image preparation failed: {exc}"
            )

        # --- Build prompt ---
        system_prompt = _VISION_SYSTEM_PROMPT.replace(
            "{category}", yolo_result.category
        )
        user_content = (
            f"The YOLO model classified this image as "
            f"'{yolo_result.category}' with confidence "
            f"{yolo_result.confidence:.2f}. "
            f"Review the image and provide your assessment."
        )

        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(
                role="user",
                content=user_content,
                images=[image_b64],
            ),
        ]

        # --- Send to vision model ---
        response, source = self._router.route_vision(
            messages, format_schema=_VISION_OUTPUT_SCHEMA
        )

        if response is None:
            logger.info("Vision model unavailable — using stub review")
            return create_stub_review(reason="Vision model unavailable")

        # --- Parse response ---
        try:
            return self._parse_review(response.content, yolo_result)
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Failed to parse vision review response: %s — using stub",
                exc,
            )
            return create_stub_review(
                reason=f"Failed to parse response: {exc}"
            )

    def _parse_review(
        self,
        raw_content: str,
        yolo_result: YoloResult,
    ) -> VisualReview:
        """Parse the LLM response into a VisualReview."""
        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError:
            raise ValueError(f"Vision response is not valid JSON: {raw_content[:200]}")

        matches = data.get("matches_category", "unclear")
        if matches not in ("yes", "no", "unclear"):
            matches = "unclear"

        review = VisualReview(
            scene_description=data.get("scene_description", ""),
            matches_category=matches,
            image_quality_issues=data.get("image_quality_issues", []),
            possible_faces_or_plates=data.get(
                "possible_faces_or_plates", False
            ),
            warnings=data.get("warnings", []),
            source="gemma",
        )

        # --- Advisory escalation logic ---
        # If the VLM disagrees with YOLO, flag it
        if review.matches_category == "no":
            review.vlm_disagrees = True
            review.warnings.append(
                "VLM assessment does not match YOLO category. "
                "Flagged for human review."
            )

        # NEVER change YOLO category or confidence
        # NEVER lower needs_verification
        # (We don't touch yolo_result at all — review is a separate object)

        return review
