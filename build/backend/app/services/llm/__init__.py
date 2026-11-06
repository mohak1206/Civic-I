"""
Civic-I LLM services — Ollama multi-model integration.

Modules:
  client        – shared httpx Ollama client
  model_router  – role-based model routing with fallback
  draft_generator – inspection-request draft generation
  output_guard  – JSON validation and forbidden-phrase checking
  templates     – deterministic template fallback
  health        – Ollama availability check
"""

from build.backend.app.services.llm.client import OllamaClient
from build.backend.app.services.llm.model_router import ModelRouter
from build.backend.app.services.llm.draft_generator import (
    DraftGenerator,
    DraftInput,
    AdvisoryResult,
    Recommendation,
)
from build.backend.app.services.llm.health import check_ollama_health

__all__ = [
    "OllamaClient",
    "ModelRouter",
    "DraftGenerator",
    "DraftInput",
    "AdvisoryResult",
    "Recommendation",
    "check_ollama_health",
]
