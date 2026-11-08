"""
Deterministic template fallback for inspection-request drafts.

This is the final fallback when all Ollama models are unavailable.
It is also what the deployed / live URL uses (since it cannot reach
a local Ollama instance).

Output is fully deterministic: same input → same output.
"""

from __future__ import annotations

from typing import Any

# Fixed footer appended by code (not by the model) to every advisory.
ADVISORY_FOOTER = (
    "AI-generated draft for official review. "
    "Authority shown is PLACEHOLDER data. "
    "No work order has been issued."
)


def generate_template_draft(draft_input: dict[str, Any]) -> dict[str, Any]:
    """
    Generate a deterministic inspection-request draft from structured input.

    Parameters
    ----------
    draft_input : dict
        Must contain at least ``category``.  Other expected keys:
        ``severity_label``, ``priority_score``, ``priority_factors``,
        ``ward_name``, ``zone_name``, ``road_name``,
        ``independent_report_count``, ``days_open``,
        ``visual_review_summary``, ``authority_name_placeholder``.

    Returns
    -------
    dict
        Structured advisory result with all required fields.
    """
    category = draft_input.get("category", "unknown")
    severity = draft_input.get("severity_label", "unassessed")
    priority_score = draft_input.get("priority_score", 0)
    ward = draft_input.get("ward_name", "unspecified ward")
    zone = draft_input.get("zone_name", "unspecified zone")
    road = draft_input.get("road_name", "unspecified road")
    report_count = draft_input.get("independent_report_count", 1)
    days_open = draft_input.get("days_open", 0)
    authority = draft_input.get(
        "authority_name_placeholder", "[PLACEHOLDER AUTHORITY]"
    )
    visual_summary = draft_input.get("visual_review_summary", "")

    # Determine recommendation based on simple rules
    if report_count > 3:
        recommendation = "review_possible_duplicate"
        rationale = (
            f"Multiple independent reports ({report_count}) received "
            f"for this location. Review for possible duplicate."
        )
    elif severity in ("high", "critical") or priority_score >= 80:
        recommendation = "route_for_inspection"
        rationale = (
            f"Severity is '{severity}' with priority score {priority_score}. "
            f"Recommend routing for field inspection."
        )
    elif priority_score < 30:
        recommendation = "request_more_info"
        rationale = (
            f"Priority score is low ({priority_score}). "
            f"Additional details may be needed."
        )
    else:
        recommendation = "needs_human_verification"
        rationale = (
            f"Moderate priority ({priority_score}). "
            f"Recommend human review before action."
        )

    location_str = f"{road}, {ward}, {zone}"

    subject = (
        f"Inspection Request: {category.replace('_', ' ').title()} "
        f"reported at {location_str}"
    )

    body_lines = [
        f"Dear {authority},",
        "",
        f"A reported {category.replace('_', ' ')} issue has been logged "
        f"at {location_str}.",
        "",
        f"Severity: {severity}",
        f"Priority score: {priority_score}",
        f"Independent reports: {report_count}",
        f"Days open: {days_open}",
    ]
    if visual_summary:
        body_lines.append(f"Visual review note: {visual_summary}")
    body_lines.extend([
        "",
        "This is a draft request to inspect the reported issue. "
        "A photograph shows only visible surface defects observed at "
        "the location. No engineering assessment has been performed.",
        "",
        "Requested action: field inspection and assessment.",
    ])

    body = "\n".join(body_lines)

    requested_action = (
        f"Inspect reported {category.replace('_', ' ')} at {location_str}."
    )

    return {
        "subject": subject,
        "body": body,
        "requested_action": requested_action,
        "recommendation": recommendation,
        "rationale": rationale,
        "source": "template",
        "model_name": "template-fallback",
        "warnings": [],
        "disclaimer": ADVISORY_FOOTER,
    }
