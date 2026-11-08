"""
Shared httpx-based Ollama client.

Handles POST /api/chat with structured output, per-role timeouts,
retries, and qwen think-mode stripping.  No LangChain / LangGraph.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Any

import httpx

from build.backend.app.core.settings import (
    OLLAMA_BASE_URL,
    OLLAMA_KEEP_ALIVE,
    OLLAMA_TEMPERATURE,
    OLLAMA_TEXT_RETRIES,
    OLLAMA_TEXT_TIMEOUT,
    OLLAMA_VISION_RETRIES,
    OLLAMA_VISION_TIMEOUT,
)

logger = logging.getLogger(__name__)


# ── Exceptions ──────────────────────────────────────────────────────────────

class OllamaError(Exception):
    """Base exception for Ollama client errors."""


class OllamaConnectionError(OllamaError):
    """Ollama server is unreachable."""


class OllamaTimeoutError(OllamaError):
    """Request to Ollama timed out."""


class OllamaInvalidResponseError(OllamaError):
    """Ollama returned a response that could not be parsed."""


class OllamaModelNotFoundError(OllamaError):
    """Requested model is not installed in Ollama."""


# ── Data classes ────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class OllamaResponse:
    """Parsed response from Ollama /api/chat."""
    content: str
    parsed_json: dict[str, Any] | None
    model: str
    total_duration_ns: int = 0
    eval_count: int = 0


@dataclass
class ChatMessage:
    """A single chat message for Ollama."""
    role: str
    content: str
    images: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {"role": self.role, "content": self.content}
        if self.images:
            d["images"] = self.images
        return d


# ── Qwen think-stripping ───────────────────────────────────────────────────

_THINK_PATTERN = re.compile(
    r"<think>.*?</think>", re.DOTALL | re.IGNORECASE
)


def _strip_thinking(text: str) -> str:
    """Remove <think>…</think> blocks that qwen may emit even with think=false."""
    return _THINK_PATTERN.sub("", text).strip()


# ── Client ──────────────────────────────────────────────────────────────────

class OllamaClient:
    """
    Synchronous Ollama REST client.

    Parameters
    ----------
    base_url : str, optional
        Ollama API base URL.  Defaults to settings.OLLAMA_BASE_URL.
    """

    def __init__(self, base_url: str | None = None) -> None:
        self._base_url = (base_url or OLLAMA_BASE_URL).rstrip("/")

    # ── public API ──────────────────────────────────────────────────────

    def chat(
        self,
        *,
        model: str,
        messages: list[ChatMessage],
        format_schema: dict[str, Any] | None = None,
        is_vision: bool = False,
        is_qwen: bool = False,
    ) -> OllamaResponse:
        """
        Send a chat completion request to Ollama.

        Applies the correct timeout and retry count based on
        ``is_vision``.  For qwen models, disables thinking and
        strips residual ``<think>`` blocks.

        Returns
        -------
        OllamaResponse
            Parsed response with optional structured JSON.

        Raises
        ------
        OllamaConnectionError, OllamaTimeoutError,
        OllamaModelNotFoundError, OllamaInvalidResponseError
        """
        timeout = OLLAMA_VISION_TIMEOUT if is_vision else OLLAMA_TEXT_TIMEOUT
        max_retries = OLLAMA_VISION_RETRIES if is_vision else OLLAMA_TEXT_RETRIES

        payload = self._build_payload(
            model=model,
            messages=messages,
            format_schema=format_schema,
            is_qwen=is_qwen,
        )

        last_exc: Exception | None = None
        for attempt in range(max_retries + 1):
            try:
                return self._send(payload, timeout=timeout)
            except OllamaModelNotFoundError:
                raise  # no point retrying a missing model
            except (OllamaConnectionError, OllamaTimeoutError) as exc:
                last_exc = exc
                if attempt < max_retries:
                    logger.warning(
                        "Ollama attempt %d/%d failed (%s): %s — retrying",
                        attempt + 1,
                        max_retries + 1,
                        type(exc).__name__,
                        exc,
                    )
                else:
                    logger.error(
                        "Ollama attempt %d/%d failed (%s): %s — giving up",
                        attempt + 1,
                        max_retries + 1,
                        type(exc).__name__,
                        exc,
                    )

        assert last_exc is not None
        raise last_exc

    # ── internals ───────────────────────────────────────────────────────

    def _build_payload(
        self,
        *,
        model: str,
        messages: list[ChatMessage],
        format_schema: dict[str, Any] | None,
        is_qwen: bool,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": model,
            "messages": [m.to_dict() for m in messages],
            "stream": False,
            "options": {
                "temperature": OLLAMA_TEMPERATURE,
            },
            "keep_alive": OLLAMA_KEEP_ALIVE,
        }
        if format_schema is not None:
            payload["format"] = format_schema
        if is_qwen:
            payload["options"]["think"] = False
        return payload

    def _send(
        self, payload: dict[str, Any], *, timeout: int
    ) -> OllamaResponse:
        url = f"{self._base_url}/api/chat"
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(url, json=payload)
        except httpx.ConnectError as exc:
            raise OllamaConnectionError(
                f"Cannot connect to Ollama at {self._base_url}: {exc}"
            ) from exc
        except httpx.TimeoutException as exc:
            raise OllamaTimeoutError(
                f"Ollama request timed out after {timeout}s: {exc}"
            ) from exc

        # Model-not-found check (Ollama returns 404 or error message)
        if response.status_code == 404:
            raise OllamaModelNotFoundError(
                f"Model not found: {payload.get('model')}"
            )
        if response.status_code != 200:
            # Some Ollama versions return 200 with an error field
            try:
                body = response.json()
                if "error" in body:
                    err_msg = body["error"]
                    if "not found" in err_msg.lower():
                        raise OllamaModelNotFoundError(
                            f"Model not found: {err_msg}"
                        )
                    raise OllamaError(f"Ollama error: {err_msg}")
            except (json.JSONDecodeError, KeyError):
                pass
            raise OllamaError(
                f"Ollama returned HTTP {response.status_code}: "
                f"{response.text[:200]}"
            )

        # Parse response body
        try:
            body = response.json()
        except json.JSONDecodeError as exc:
            raise OllamaInvalidResponseError(
                f"Ollama returned non-JSON response: {exc}"
            ) from exc

        # Check for error in body (some Ollama versions)
        if "error" in body:
            err_msg = body["error"]
            if "not found" in err_msg.lower():
                raise OllamaModelNotFoundError(f"Model not found: {err_msg}")
            raise OllamaError(f"Ollama error: {err_msg}")

        # Extract content
        raw_content = ""
        try:
            raw_content = body["message"]["content"]
        except (KeyError, TypeError) as exc:
            raise OllamaInvalidResponseError(
                f"Ollama response missing message.content: {exc}"
            ) from exc

        # Strip qwen thinking if present
        content = _strip_thinking(raw_content)

        # Try parsing as JSON
        parsed_json: dict[str, Any] | None = None
        try:
            parsed_json = json.loads(content)
        except (json.JSONDecodeError, TypeError):
            pass  # Not all responses are JSON

        return OllamaResponse(
            content=content,
            parsed_json=parsed_json,
            model=body.get("model", payload.get("model", "")),
            total_duration_ns=body.get("total_duration", 0),
            eval_count=body.get("eval_count", 0),
        )
