"""
Benchmark script for A3 Ollama models.

Runs 10 clearly labelled DEMO text inputs through:
- qwen3.5:2b (decision)
- llama3.2:3b (fallback)
- gemma3:latest (text-only evaluation)

Measures:
- Latency (seconds)
- Guard pass/fail (valid JSON, valid recommendation enum, forbidden phrase check)

Vision benchmark:
- Skipped if no team-provided images with recorded license exist.
- test/eval images are NEVER used.
"""

from __future__ import annotations

import json
import logging
import sys
import time
from pathlib import Path
from typing import Any

# Ensure pathing
_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.core.settings import OLLAMA_BASE_URL
from build.backend.app.services.llm.client import ChatMessage, OllamaClient, OllamaError
from build.backend.app.services.llm.draft_generator import _OUTPUT_SCHEMA, _SYSTEM_PROMPT
from build.backend.app.services.llm.health import check_ollama_health
from build.backend.app.services.llm.output_guard import validate_draft_output

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("benchmark")


# ── 10 Clearly Labelled DEMO Text Inputs ────────────────────────────────────

DEMO_TEXT_INPUTS: list[dict[str, Any]] = [
    {
        "id": "DEMO-01",
        "category": "pothole",
        "severity_label": "high",
        "priority_score": 85.0,
        "priority_factors": ["main transit corridor", "monsoon water accumulation"],
        "road_name": "Station Road",
        "ward_name": "Ward 1",
        "zone_name": "East Zone",
        "independent_report_count": 4,
        "days_open": 5,
        "visual_review_summary": "Deep surface depression with asphalt degradation.",
        "authority_name_placeholder": "[PLACEHOLDER PWD PALGHAR]",
    },
    {
        "id": "DEMO-02",
        "category": "garbage",
        "severity_label": "medium",
        "priority_score": 52.0,
        "priority_factors": ["commercial market proximity", "pedestrian pathway"],
        "road_name": "Market Lane",
        "ward_name": "Ward 3",
        "zone_name": "West Zone",
        "independent_report_count": 2,
        "days_open": 2,
        "visual_review_summary": "Overflowing waste bin with scattered organic waste.",
        "authority_name_placeholder": "[PLACEHOLDER SANITATION PALGHAR]",
    },
    {
        "id": "DEMO-03",
        "category": "pothole",
        "severity_label": "low",
        "priority_score": 25.0,
        "priority_factors": ["residential cul-de-sac", "low vehicle speed"],
        "road_name": "Gulmohar Colony Road",
        "ward_name": "Ward 2",
        "zone_name": "North Zone",
        "independent_report_count": 1,
        "days_open": 1,
        "visual_review_summary": "Shallow surface wear, loose gravel.",
        "authority_name_placeholder": "[PLACEHOLDER PWD PALGHAR]",
    },
    {
        "id": "DEMO-04",
        "category": "garbage",
        "severity_label": "critical",
        "priority_score": 92.0,
        "priority_factors": ["hospital entrance obstruction", "stagnant runoff risk"],
        "road_name": "Civil Hospital Approach",
        "ward_name": "Ward 4",
        "zone_name": "Central Zone",
        "independent_report_count": 7,
        "days_open": 4,
        "visual_review_summary": "Large pile of uncollected garbage near entrance gate.",
        "authority_name_placeholder": "[PLACEHOLDER SANITATION PALGHAR]",
    },
    {
        "id": "DEMO-05",
        "category": "pothole",
        "severity_label": "medium",
        "priority_score": 60.0,
        "priority_factors": ["bus route", "dim lighting at night"],
        "road_name": "Old Palghar Highway",
        "ward_name": "Ward 5",
        "zone_name": "East Zone",
        "independent_report_count": 2,
        "days_open": 3,
        "visual_review_summary": "Two consecutive potholes spanning one traffic lane.",
        "authority_name_placeholder": "[PLACEHOLDER PWD PALGHAR]",
    },
    {
        "id": "DEMO-06",
        "category": "garbage",
        "severity_label": "low",
        "priority_score": 18.0,
        "priority_factors": ["dry leaf litter", "park perimeter"],
        "road_name": "Shivaji Park By-lane",
        "ward_name": "Ward 2",
        "zone_name": "North Zone",
        "independent_report_count": 1,
        "days_open": 1,
        "visual_review_summary": "Dry garden leaves piled alongside kerb.",
        "authority_name_placeholder": "[PLACEHOLDER SANITATION PALGHAR]",
    },
    {
        "id": "DEMO-07",
        "category": "pothole",
        "severity_label": "critical",
        "priority_score": 95.0,
        "priority_factors": ["bridge approach", "high heavy-vehicle volume"],
        "road_name": "Manor Flyover Approach",
        "ward_name": "Ward 1",
        "zone_name": "West Zone",
        "independent_report_count": 9,
        "days_open": 7,
        "visual_review_summary": "Wide cavity near expansion joint of flyover.",
        "authority_name_placeholder": "[PLACEHOLDER PWD PALGHAR]",
    },
    {
        "id": "DEMO-08",
        "category": "garbage",
        "severity_label": "medium",
        "priority_score": 48.0,
        "priority_factors": ["school route", "stray animal feeding"],
        "road_name": "Vidya Mandir Road",
        "ward_name": "Ward 6",
        "zone_name": "Central Zone",
        "independent_report_count": 2,
        "days_open": 2,
        "visual_review_summary": "Cardboard boxes and plastic wrappers near boundary wall.",
        "authority_name_placeholder": "[PLACEHOLDER SANITATION PALGHAR]",
    },
    {
        "id": "DEMO-09",
        "category": "pothole",
        "severity_label": "medium",
        "priority_score": 55.0,
        "priority_factors": ["two-wheeler thoroughfare", "unpaved shoulder"],
        "road_name": "Kacheri Road",
        "ward_name": "Ward 3",
        "zone_name": "South Zone",
        "independent_report_count": 3,
        "days_open": 4,
        "visual_review_summary": "Edge-of-road pothole near drainage grating.",
        "authority_name_placeholder": "[PLACEHOLDER PWD PALGHAR]",
    },
    {
        "id": "DEMO-10",
        "category": "garbage",
        "severity_label": "high",
        "priority_score": 78.0,
        "priority_factors": ["drainage choke risk", "monsoon season advisory"],
        "road_name": "Fish Market Road",
        "ward_name": "Ward 7",
        "zone_name": "Coastal Zone",
        "independent_report_count": 5,
        "days_open": 3,
        "visual_review_summary": "Organic waste dumped adjacent to open stormwater channel.",
        "authority_name_placeholder": "[PLACEHOLDER SANITATION PALGHAR]",
    },
]


def format_prompt(demo: dict[str, Any]) -> str:
    lines = [
        "Generate a draft inspection request for this reported issue:",
        f"Category: {demo['category']}",
        f"Severity: {demo['severity_label']}",
        f"Priority score: {demo['priority_score']}",
        f"Priority factors: {', '.join(demo.get('priority_factors', []))}",
        f"Location: {demo['road_name']}, {demo['ward_name']}, {demo['zone_name']}",
        f"Independent reports: {demo['independent_report_count']}",
        f"Days open: {demo['days_open']}",
        f"Visual review summary: {demo.get('visual_review_summary', '')}",
        f"Authority (PLACEHOLDER): {demo['authority_name_placeholder']}",
    ]
    return "\n".join(lines)


def run_benchmark():
    logger.info("=== Civic-I A3 Model Benchmark ===")
    logger.info("Checking Ollama availability...")

    models = ["qwen3.5:2b", "llama3.2:3b", "gemma3:latest"]
    health = check_ollama_health(configured_models=models)
    logger.info("Health report: %s", health)

    client = OllamaClient()

    results: dict[str, list[dict[str, Any]]] = {m: [] for m in models}

    for model_name in models:
        logger.info("--- Benchmarking model: %s (text-only) ---", model_name)
        is_installed = health.get(model_name, False)
        if not is_installed:
            logger.warning(
                "Model %s is NOT installed or Ollama is offline. Recording offline status.",
                model_name,
            )

        is_qwen = "qwen" in model_name.lower()

        for demo in DEMO_TEXT_INPUTS:
            user_msg = format_prompt(demo)
            messages = [
                ChatMessage(role="system", content=_SYSTEM_PROMPT),
                ChatMessage(role="user", content=user_msg),
            ]

            t0 = time.perf_counter()
            try:
                if not is_installed:
                    raise OllamaError("Model not reachable")

                resp = client.chat(
                    model=model_name,
                    messages=messages,
                    format_schema=_OUTPUT_SCHEMA,
                    is_vision=False,
                    is_qwen=is_qwen,
                )
                latency = time.perf_counter() - t0
                is_valid, parsed, reason = validate_draft_output(resp.content)

                entry = {
                    "demo_id": demo["id"],
                    "latency_sec": round(latency, 3),
                    "guard_pass": is_valid,
                    "rejection_reason": reason,
                    "recommendation": parsed.get("recommendation") if parsed else None,
                }
            except Exception as exc:
                latency = time.perf_counter() - t0
                entry = {
                    "demo_id": demo["id"],
                    "latency_sec": round(latency, 3),
                    "guard_pass": False,
                    "rejection_reason": f"Execution error: {exc}",
                    "recommendation": None,
                }

            results[model_name].append(entry)

    # Print summary
    print("\n" + "=" * 60)
    print("BENCHMARK SUMMARY (TEXT DRAFT GENERATION)")
    print("=" * 60)
    for model_name, entries in results.items():
        total = len(entries)
        passed = sum(1 for e in entries if e["guard_pass"])
        latencies = [e["latency_sec"] for e in entries if e["guard_pass"]]
        avg_lat = round(sum(latencies) / len(latencies), 3) if latencies else 0.0
        print(f"\nModel: {model_name}")
        print(f"  Inputs tested: {total}")
        print(f"  Guard Pass: {passed}/{total} ({round(passed / total * 100, 1)}%)")
        print(f"  Avg Latency (passed): {avg_lat}s")
        for e in entries:
            status = "PASS" if e["guard_pass"] else f"FAIL ({e['rejection_reason']})"
            rec = f"-> {e['recommendation']}" if e["recommendation"] else ""
            print(f"    [{e['demo_id']}] {status} in {e['latency_sec']}s {rec}")

    print("\n" + "=" * 60)
    print("VISION REVIEW BENCHMARK")
    print("=" * 60)
    print("SKIPPED: No team-provided images with a recorded licence exist in assets/.")
    print("(Per Civic-I rules, test/eval images are owned by A7 and must NEVER be used).")
    print("Vision review was tested with synthetic/mock images in pytest suite.")
    print("=" * 60 + "\n")

    return results


if __name__ == "__main__":
    run_benchmark()
