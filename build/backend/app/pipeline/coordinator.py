"""
Pipeline coordinator — sequential orchestration of analysis steps.

Steps (all non-fatal):
  1. YOLO classification (existing/stub)
  2. Gemma visual review (step 3b, advisory, non-fatal)
  3. Duplicate check (placeholder — A4)
  4. Priority scoring (placeholder — A4's rule-based engine)
  5. Authority lookup (PLACEHOLDER data)
  6. Qwen advisory + draft (llama fallback, then template)

Each step logs which model or fallback was used.
Each step saves its result so earlier work is not lost.
The pipeline never raises.  Returns a PipelineResult dict.

Storage: the pipeline does NOT persist results to any database.
A2 is responsible for wiring PipelineResult to the data layer.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from build.backend.app.services.llm.client import OllamaClient
from build.backend.app.services.llm.draft_generator import (
    AdvisoryResult,
    DraftGenerator,
    DraftInput,
)
from build.backend.app.services.llm.model_router import ModelRouter
from build.backend.app.services.vision.reviewer import (
    VisualReview,
    VisualReviewer,
    YoloResult,
)

logger = logging.getLogger(__name__)


# ── Pipeline result ─────────────────────────────────────────────────────────

@dataclass
class PipelineResult:
    """
    Aggregated output of the pipeline.

    A2 should persist this (suggested: ``ai_analyses`` JSON field
    on the report model).
    """

    yolo_result: dict[str, Any] | None = None
    visual_review: dict[str, Any] | None = None
    duplicate_check: dict[str, Any] | None = None
    priority_result: dict[str, Any] | None = None
    authority_lookup: dict[str, Any] | None = None
    advisory_draft: dict[str, Any] | None = None
    step_log: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    completed: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Serialize for JSON storage."""
        return {
            "yolo_result": self.yolo_result,
            "visual_review": self.visual_review,
            "duplicate_check": self.duplicate_check,
            "priority_result": self.priority_result,
            "authority_lookup": self.authority_lookup,
            "advisory_draft": self.advisory_draft,
            "step_log": self.step_log,
            "warnings": self.warnings,
            "completed": self.completed,
        }


# ── Pipeline ────────────────────────────────────────────────────────────────

def run_pipeline(
    *,
    image_bytes: bytes | None = None,
    yolo_result: dict[str, Any] | None = None,
    report_data: dict[str, Any] | None = None,
    client: OllamaClient | None = None,
) -> PipelineResult:
    """
    Run the full analysis pipeline.

    Parameters
    ----------
    image_bytes : bytes, optional
        Raw image for vision review.  If None, vision step is skipped.
    yolo_result : dict, optional
        Pre-existing YOLO result (from the YOLO service).
        If None, a stub is used.
    report_data : dict, optional
        Report metadata (category, location, etc.) for the advisory.
    client : OllamaClient, optional
        Pre-configured Ollama client.

    Returns
    -------
    PipelineResult
        Never raises.
    """
    result = PipelineResult()
    report = report_data or {}

    ollama_client = client or OllamaClient()
    router = ModelRouter(client=ollama_client)

    # ── Step 1: YOLO classification ─────────────────────────────────
    yolo = _step_yolo(yolo_result, result)

    # ── Step 2: Visual review (gemma3, non-fatal) ───────────────────
    visual_summary = _step_visual_review(
        image_bytes, yolo, router, result
    )

    # ── Step 3: Duplicate check (placeholder — A4) ──────────────────
    _step_duplicate_check(report, result)

    # ── Step 4: Priority scoring (placeholder — A4) ─────────────────
    _step_priority(report, result)

    # ── Step 5: Authority lookup (PLACEHOLDER) ──────────────────────
    _step_authority_lookup(report, result)

    # ── Step 6: Advisory draft (qwen → llama → template) ────────────
    _step_advisory_draft(report, visual_summary, router, result)

    result.completed = True
    logger.info("Pipeline completed: %s", result.step_log)
    return result


# ── Individual steps ────────────────────────────────────────────────────────

def _step_yolo(
    yolo_dict: dict[str, Any] | None,
    result: PipelineResult,
) -> YoloResult | None:
    """Step 1: Accept or stub YOLO result."""
    try:
        if yolo_dict:
            yolo = YoloResult(**yolo_dict)
            result.yolo_result = yolo_dict
            result.step_log.append("yolo: provided")
            return yolo
        else:
            result.yolo_result = None
            result.step_log.append("yolo: not provided (skipped)")
            result.warnings.append("No YOLO result provided")
            return None
    except Exception as exc:  # noqa: BLE001
        logger.warning("YOLO step failed: %s", exc)
        result.step_log.append(f"yolo: error ({exc})")
        result.warnings.append(f"YOLO step error: {exc}")
        return None


def _step_visual_review(
    image_bytes: bytes | None,
    yolo: YoloResult | None,
    router: ModelRouter,
    result: PipelineResult,
) -> str:
    """Step 2: Gemma visual review (non-fatal)."""
    if image_bytes is None or yolo is None:
        result.step_log.append("visual_review: skipped (no image or no YOLO)")
        return ""

    try:
        reviewer = VisualReviewer(router=router)
        review = reviewer.review(image_bytes, yolo)
        result.visual_review = review.model_dump()
        result.step_log.append(f"visual_review: {review.source}")

        # Return a summary for the draft generator
        summary_parts = []
        if review.scene_description:
            summary_parts.append(review.scene_description)
        if review.matches_category != "yes":
            summary_parts.append(
                f"VLM match: {review.matches_category}"
            )
        if review.image_quality_issues:
            summary_parts.append(
                f"Quality issues: {', '.join(review.image_quality_issues)}"
            )
        return "; ".join(summary_parts) if summary_parts else ""

    except Exception as exc:  # noqa: BLE001
        logger.warning("Visual review step failed: %s", exc)
        result.step_log.append(f"visual_review: error ({exc})")
        result.warnings.append(f"Visual review error: {exc}")
        return ""


def _step_duplicate_check(
    report: dict[str, Any],
    result: PipelineResult,
) -> None:
    """Step 3: Duplicate check (placeholder — A4's responsibility)."""
    # Placeholder: A4's dedup engine is not yet available
    result.duplicate_check = {
        "status": "placeholder",
        "note": "Duplicate detection not yet implemented (A4)",
    }
    result.step_log.append("duplicate_check: placeholder (A4)")


def _step_priority(
    report: dict[str, Any],
    result: PipelineResult,
) -> None:
    """Step 4: Priority scoring (placeholder — A4's rule-based engine)."""
    # Placeholder: A4's priority engine is not yet available.
    # The pipeline NEVER writes to priority_scores or changes status.
    result.priority_result = {
        "status": "placeholder",
        "note": (
            "Rule-based priority scoring not yet integrated (A4). "
            "The AI advisory never overrides the rule-based score."
        ),
    }
    result.step_log.append("priority: placeholder (A4)")


def _step_authority_lookup(
    report: dict[str, Any],
    result: PipelineResult,
) -> None:
    """Step 5: Authority lookup (PLACEHOLDER data)."""
    result.authority_lookup = {
        "authority_name": "[PLACEHOLDER AUTHORITY]",
        "department": "[PLACEHOLDER DEPARTMENT]",
        "note": "PLACEHOLDER — real authority mapping not yet available",
    }
    result.step_log.append("authority_lookup: PLACEHOLDER")


def _step_advisory_draft(
    report: dict[str, Any],
    visual_summary: str,
    router: ModelRouter,
    result: PipelineResult,
) -> None:
    """Step 6: Advisory draft generation (qwen → llama → template)."""
    try:
        draft_input = DraftInput(
            category=report.get("category", "unknown"),
            severity_label=report.get("severity_label", "unassessed"),
            priority_score=report.get("priority_score", 0.0),
            priority_factors=report.get("priority_factors", []),
            ward_name=report.get("ward_name", "unspecified ward"),
            zone_name=report.get("zone_name", "unspecified zone"),
            road_name=report.get("road_name", "unspecified road"),
            independent_report_count=report.get(
                "independent_report_count", 1
            ),
            days_open=report.get("days_open", 0),
            visual_review_summary=visual_summary,
            authority_name_placeholder=report.get(
                "authority_name_placeholder", "[PLACEHOLDER AUTHORITY]"
            ),
        )

        generator = DraftGenerator(router=router)
        advisory: AdvisoryResult = generator.generate(draft_input)
        result.advisory_draft = advisory.model_dump()
        result.step_log.append(f"advisory_draft: {advisory.source}")

    except Exception as exc:  # noqa: BLE001
        logger.warning("Advisory draft step failed: %s", exc)
        result.step_log.append(f"advisory_draft: error ({exc})")
        result.warnings.append(f"Advisory draft error: {exc}")
