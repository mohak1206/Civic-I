"""
Inspection-request draft generator.

Uses qwen3.5:2b (decision) → llama3.2:3b (fallback) → template.
Each step saves its result so earlier work is never lost.
Never raises — always returns an AdvisoryResult.
"""

from __future__ import annotations

import json
import logging
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from build.backend.app.services.llm.client import ChatMessage, OllamaClient
from build.backend.app.services.llm.model_router import ModelRouter
from build.backend.app.services.llm.output_guard import validate_draft_output
from build.backend.app.services.llm.templates import (
    ADVISORY_FOOTER,
    generate_template_draft,
)

logger = logging.getLogger(__name__)


# ── Enums and models ───────────────────────────────────────────────────────

class Recommendation(str, Enum):
    """Allowed advisory recommendations."""
    ROUTE_FOR_INSPECTION = "route_for_inspection"
    REQUEST_MORE_INFO = "request_more_info"
    REVIEW_POSSIBLE_DUPLICATE = "review_possible_duplicate"
    NEEDS_HUMAN_VERIFICATION = "needs_human_verification"


class DraftInput(BaseModel):
    """
    Input for draft generation.

    Extra fields are FORBIDDEN — this rejects reporter name, contact
    details, user id, or raw citizen description.
    """

    model_config = ConfigDict(extra="forbid")

    category: str
    severity_label: str = "unassessed"
    priority_score: float = 0.0
    priority_factors: list[str] = Field(default_factory=list)
    ward_name: str = "unspecified ward"
    zone_name: str = "unspecified zone"
    road_name: str = "unspecified road"
    independent_report_count: int = 1
    days_open: int = 0
    visual_review_summary: str = ""
    authority_name_placeholder: str = "[PLACEHOLDER AUTHORITY]"


class AdvisoryResult(BaseModel):
    """Structured output of the draft generator."""

    subject: str
    body: str
    requested_action: str
    recommendation: Recommendation
    rationale: str
    source: str  # "qwen" | "llama" | "template"
    model_name: str
    warnings: list[str] = Field(default_factory=list)
    disclaimer: str = ADVISORY_FOOTER


# ── System prompt ──────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are generating a DRAFT inspection request for a reported civic issue.
The text is a DRAFT request to INSPECT a reported issue.

STRICT RULES:
- Do NOT claim a work order was issued.
- Do NOT claim a team was assigned or dispatched.
- Do NOT claim the issue is confirmed or engineering-assessed.
- A photo shows only visible surface defects. Do NOT make statements about depth, structural integrity, or underground conditions.
- Use only the facts supplied below. Do not invent details.
- Keep the text short and formal.
- Answer ONLY in the requested JSON format with these exact fields:
  subject, body, requested_action, recommendation, rationale

recommendation MUST be one of: "route_for_inspection", "request_more_info", "review_possible_duplicate", "needs_human_verification"
"""

_OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "subject": {"type": "string"},
        "body": {"type": "string"},
        "requested_action": {"type": "string"},
        "recommendation": {
            "type": "string",
            "enum": [
                "route_for_inspection",
                "request_more_info",
                "review_possible_duplicate",
                "needs_human_verification",
            ],
        },
        "rationale": {"type": "string"},
    },
    "required": [
        "subject",
        "body",
        "requested_action",
        "recommendation",
        "rationale",
    ],
}


# ── Draft generator ────────────────────────────────────────────────────────

class DraftGenerator:
    """
    Generates inspection-request drafts with model fallback.

    Tries: decision model (qwen) → fallback model (llama) → template.
    Each step validates output through the output guard.
    Never raises.

    Parameters
    ----------
    router : ModelRouter, optional
        Pre-configured router. A default is created if omitted.
    """

    def __init__(self, router: ModelRouter | None = None) -> None:
        self._router = router or ModelRouter()

    def generate(self, draft_input: DraftInput) -> AdvisoryResult:
        """
        Generate an advisory draft.  Never raises.

        Returns an ``AdvisoryResult`` from the first source that
        passes the output guard, or from the deterministic template.
        """
        input_dict = draft_input.model_dump()
        user_content = self._format_user_prompt(input_dict)

        messages = [
            ChatMessage(role="system", content=_SYSTEM_PROMPT),
            ChatMessage(role="user", content=user_content),
        ]

        # --- Try LLM models via router ---
        response, source = self._router.route_text(
            messages, format_schema=_OUTPUT_SCHEMA
        )

        if response is not None:
            # Validate the output
            raw = response.content
            is_valid, parsed, reason = validate_draft_output(raw)

            if is_valid and parsed is not None:
                logger.info(
                    "Draft generated by %s (model: %s)",
                    source,
                    response.model,
                )
                return self._build_result(
                    parsed, source=source, model_name=response.model
                )
            else:
                logger.warning(
                    "Output from %s failed guard (%s) — trying next",
                    source,
                    reason,
                )
                # If the first model failed guard, we need to try
                # fallback explicitly if we haven't already
                if source in ("qwen", self._router.decision_model):
                    fallback_result = self._try_fallback_only(messages)
                    if fallback_result is not None:
                        return fallback_result

        # --- Deterministic template ---
        logger.info("Using deterministic template fallback")
        template_data = generate_template_draft(input_dict)
        return AdvisoryResult(**template_data)

    def _try_fallback_only(
        self, messages: list[ChatMessage]
    ) -> AdvisoryResult | None:
        """Try only the fallback model (skipping decision)."""
        try:
            is_qwen = "qwen" in self._router.fallback_model.lower()
            client = self._router._client
            resp = client.chat(
                model=self._router.fallback_model,
                messages=messages,
                format_schema=_OUTPUT_SCHEMA,
                is_vision=False,
                is_qwen=is_qwen,
            )
            raw = resp.content
            is_valid, parsed, reason = validate_draft_output(raw)
            if is_valid and parsed is not None:
                source = (
                    "llama"
                    if "llama" in self._router.fallback_model.lower()
                    else self._router.fallback_model
                )
                logger.info(
                    "Draft generated by fallback %s (model: %s)",
                    source,
                    resp.model,
                )
                return self._build_result(
                    parsed, source=source, model_name=resp.model
                )
            else:
                logger.warning(
                    "Fallback output also failed guard: %s", reason
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Fallback model failed: %s", exc)
        return None

    @staticmethod
    def _build_result(
        parsed: dict[str, Any],
        *,
        source: str,
        model_name: str,
    ) -> AdvisoryResult:
        """Build an AdvisoryResult from parsed LLM JSON."""
        return AdvisoryResult(
            subject=parsed.get("subject", ""),
            body=parsed.get("body", ""),
            requested_action=parsed.get("requested_action", ""),
            recommendation=Recommendation(parsed["recommendation"]),
            rationale=parsed.get("rationale", ""),
            source=source,
            model_name=model_name,
            warnings=[],
            disclaimer=ADVISORY_FOOTER,
        )

    @staticmethod
    def _format_user_prompt(input_dict: dict[str, Any]) -> str:
        """Format the DraftInput dict into a user prompt."""
        lines = ["Generate a draft inspection request for this reported issue:", ""]
        lines.append(f"Category: {input_dict.get('category', 'unknown')}")
        lines.append(f"Severity: {input_dict.get('severity_label', 'unassessed')}")
        lines.append(f"Priority score: {input_dict.get('priority_score', 0)}")

        factors = input_dict.get("priority_factors", [])
        if factors:
            lines.append(f"Priority factors: {', '.join(factors)}")

        lines.append(f"Location: {input_dict.get('road_name', '')}, "
                      f"{input_dict.get('ward_name', '')}, "
                      f"{input_dict.get('zone_name', '')}")
        lines.append(
            f"Independent reports: "
            f"{input_dict.get('independent_report_count', 1)}"
        )
        lines.append(f"Days open: {input_dict.get('days_open', 0)}")

        visual = input_dict.get("visual_review_summary", "")
        if visual:
            lines.append(f"Visual review summary: {visual}")

        authority = input_dict.get(
            "authority_name_placeholder", "[PLACEHOLDER AUTHORITY]"
        )
        lines.append(f"Authority (PLACEHOLDER): {authority}")

        return "\n".join(lines)
