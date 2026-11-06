"""
Ollama health check — reports which configured models are installed.

Used for startup logging only.  Never crashes if Ollama is down.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from build.backend.app.core.settings import (
    OLLAMA_BASE_URL,
    OLLAMA_FALLBACK_MODEL,
    OLLAMA_MODEL,
    OLLAMA_VISION_MODEL,
)

logger = logging.getLogger(__name__)


def check_ollama_health(
    base_url: str | None = None,
    *,
    configured_models: list[str] | None = None,
) -> dict[str, bool]:
    """
    Query Ollama ``GET /api/tags`` and check which configured models
    are installed.

    Parameters
    ----------
    base_url : str, optional
        Override for the Ollama URL.
    configured_models : list[str], optional
        Override for the list of models to check.
        Defaults to the three configured models from settings.

    Returns
    -------
    dict[str, bool]
        Mapping of model name → is_installed.
        Returns all ``False`` if Ollama is unreachable.
    """
    url = (base_url or OLLAMA_BASE_URL).rstrip("/")
    models_to_check = configured_models or [
        OLLAMA_MODEL,
        OLLAMA_VISION_MODEL,
        OLLAMA_FALLBACK_MODEL,
    ]

    result: dict[str, bool] = {m: False for m in models_to_check}

    try:
        with httpx.Client(timeout=5) as client:
            resp = client.get(f"{url}/api/tags")
        if resp.status_code != 200:
            logger.warning(
                "Ollama /api/tags returned HTTP %d", resp.status_code
            )
            return result

        body: dict[str, Any] = resp.json()
        installed_names: set[str] = set()
        for model_info in body.get("models", []):
            name = model_info.get("name", "")
            installed_names.add(name)
            # Also add without :latest suffix for matching
            if name.endswith(":latest"):
                installed_names.add(name.removesuffix(":latest"))

        for model_name in models_to_check:
            # Check exact match and without :latest
            bare = model_name.removesuffix(":latest")
            result[model_name] = (
                model_name in installed_names or bare in installed_names
            )

        logger.info("Ollama health check: %s", result)

    except httpx.ConnectError:
        logger.warning(
            "Ollama is not reachable at %s — all models marked unavailable",
            url,
        )
    except Exception as exc:  # noqa: BLE001 — never crash
        logger.warning("Ollama health check failed: %s", exc)

    return result
