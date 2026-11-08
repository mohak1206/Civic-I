"""
Model router — role-based routing to Ollama models with fallback.

Three roles
-----------
- **vision** : gemma3 only; skipped with warning if unavailable.
- **decision** : qwen3.5:2b (primary text model).
- **fallback** : llama3.2:3b (backup text model).

Text tasks try decision → fallback → caller uses template.
All calls are strictly sequential (no concurrency).
"""

from __future__ import annotations

import logging
from typing import Any

from build.backend.app.core.settings import (
    OLLAMA_FALLBACK_MODEL,
    OLLAMA_MODEL,
    OLLAMA_VISION_MODEL,
)
from build.backend.app.services.llm.client import (
    ChatMessage,
    OllamaClient,
    OllamaError,
    OllamaResponse,
)

logger = logging.getLogger(__name__)


class ModelRouter:
    """
    Routes tasks to the appropriate Ollama model based on role.

    Parameters
    ----------
    client : OllamaClient, optional
        Pre-configured client.  A default client is created if omitted.
    decision_model : str, optional
        Override for the decision model name.
    fallback_model : str, optional
        Override for the fallback model name.
    vision_model : str, optional
        Override for the vision model name.
    """

    def __init__(
        self,
        client: OllamaClient | None = None,
        *,
        decision_model: str | None = None,
        fallback_model: str | None = None,
        vision_model: str | None = None,
    ) -> None:
        self._client = client or OllamaClient()
        self._decision_model = decision_model or OLLAMA_MODEL
        self._fallback_model = fallback_model or OLLAMA_FALLBACK_MODEL
        self._vision_model = vision_model or OLLAMA_VISION_MODEL

    # ── Public helpers ──────────────────────────────────────────────────

    @property
    def decision_model(self) -> str:
        return self._decision_model

    @property
    def fallback_model(self) -> str:
        return self._fallback_model

    @property
    def vision_model(self) -> str:
        return self._vision_model

    # ── Text routing ────────────────────────────────────────────────────

    def route_text(
        self,
        messages: list[ChatMessage],
        *,
        format_schema: dict[str, Any] | None = None,
    ) -> tuple[OllamaResponse | None, str]:
        """
        Try the decision model, then the fallback model.

        Returns
        -------
        (response, source)
            ``response`` is the OllamaResponse or None if both failed.
            ``source`` is ``"qwen"`` | ``"llama"`` | ``"none"``.
        """
        # --- Decision model (qwen) ---
        is_qwen = "qwen" in self._decision_model.lower()
        try:
            resp = self._client.chat(
                model=self._decision_model,
                messages=messages,
                format_schema=format_schema,
                is_vision=False,
                is_qwen=is_qwen,
            )
            logger.info(
                "Decision model '%s' responded successfully",
                self._decision_model,
            )
            return resp, "qwen" if is_qwen else self._decision_model
        except OllamaError as exc:
            logger.warning(
                "Decision model '%s' failed: %s — trying fallback",
                self._decision_model,
                exc,
            )

        # --- Fallback model (llama) ---
        is_qwen_fallback = "qwen" in self._fallback_model.lower()
        try:
            resp = self._client.chat(
                model=self._fallback_model,
                messages=messages,
                format_schema=format_schema,
                is_vision=False,
                is_qwen=is_qwen_fallback,
            )
            logger.info(
                "Fallback model '%s' responded successfully",
                self._fallback_model,
            )
            return resp, "llama" if "llama" in self._fallback_model.lower() else self._fallback_model
        except OllamaError as exc:
            logger.warning(
                "Fallback model '%s' also failed: %s — "
                "caller should use template",
                self._fallback_model,
                exc,
            )

        return None, "none"

    # ── Vision routing ──────────────────────────────────────────────────

    def route_vision(
        self,
        messages: list[ChatMessage],
        *,
        format_schema: dict[str, Any] | None = None,
    ) -> tuple[OllamaResponse | None, str]:
        """
        Try the vision model (gemma3).  If unavailable, return None.

        Returns
        -------
        (response, source)
            ``response`` is the OllamaResponse or None.
            ``source`` is ``"gemma"`` or ``"none"``.
        """
        try:
            resp = self._client.chat(
                model=self._vision_model,
                messages=messages,
                format_schema=format_schema,
                is_vision=True,
                is_qwen=False,
            )
            logger.info(
                "Vision model '%s' responded successfully",
                self._vision_model,
            )
            return resp, "gemma"
        except OllamaError as exc:
            logger.warning(
                "Vision model '%s' unavailable: %s — "
                "vision review step will be skipped",
                self._vision_model,
                exc,
            )
            return None, "none"
