"""
Output guard — validates LLM-generated draft JSON.

Checks:
1. Valid JSON and non-empty.
2. ``recommendation`` is in the allowed enum.
3. Text does not contain forbidden phrases implying dispatch,
   assignment, work-order issuance, or confirmed engineering findings.
"""

from __future__ import annotations

import json
import re
from typing import Any


# ── Allowed recommendation values ──────────────────────────────────────────

ALLOWED_RECOMMENDATIONS = frozenset({
    "route_for_inspection",
    "request_more_info",
    "review_possible_duplicate",
    "needs_human_verification",
})


# ── Forbidden phrases (case-insensitive) ───────────────────────────────────

_FORBIDDEN_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"\bdispatch(?:ed)?\b",
        r"\bwork\s*order\s*issued\b",
        r"\bteam\s*(?:has\s+been\s+)?assign(?:ed)?\b",
        r"\bconfirmed\s+structural\b",
        r"\bconfirmed\s+depth\b",
        r"\bengineering\s+assessment\s+confirmed\b",
        r"\bteam\s*(?:has\s+been\s+)?deploy(?:ed)?\b",
        r"\bcrew\s*(?:has\s+been\s+)?(?:assign(?:ed)?|dispatch(?:ed)?)\b",
        r"\bwork\s*order\s*(?:has\s+been\s+)?creat(?:ed)?\b",
    ]
]


def _check_forbidden(text: str) -> str | None:
    """Return the first matching forbidden phrase, or None."""
    for pattern in _FORBIDDEN_PATTERNS:
        match = pattern.search(text)
        if match:
            return match.group(0)
    return None


# ── Public API ──────────────────────────────────────────────────────────────

def validate_draft_output(
    raw: str,
) -> tuple[bool, dict[str, Any] | None, str | None]:
    """
    Validate a raw JSON string produced by the LLM.

    Returns
    -------
    (is_valid, parsed_dict_or_none, rejection_reason_or_none)
    """
    # 1. Parse JSON
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError) as exc:
        return False, None, f"Invalid JSON: {exc}"

    if not isinstance(data, dict) or not data:
        return False, None, "Empty or non-object JSON"

    # 2. Check recommendation enum
    rec = data.get("recommendation", "")
    if rec not in ALLOWED_RECOMMENDATIONS:
        return False, None, (
            f"Invalid recommendation '{rec}'. "
            f"Allowed: {sorted(ALLOWED_RECOMMENDATIONS)}"
        )

    # 3. Check forbidden phrases in all string values
    text_to_check = " ".join(
        str(v) for v in data.values() if isinstance(v, str)
    )
    forbidden = _check_forbidden(text_to_check)
    if forbidden:
        return False, None, (
            f"Forbidden phrase detected: '{forbidden}'"
        )

    return True, data, None
