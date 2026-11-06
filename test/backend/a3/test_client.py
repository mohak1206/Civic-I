"""
Tests for the shared Ollama client.

Covers: success per role, timeout, connection refused, invalid JSON,
retries, qwen think-stripping, model not found.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import httpx
import pytest

# Ensure project is on path
_PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT / "build" / "backend"))

from build.backend.app.services.llm.client import (
    ChatMessage,
    OllamaClient,
    OllamaConnectionError,
    OllamaInvalidResponseError,
    OllamaModelNotFoundError,
    OllamaTimeoutError,
    _strip_thinking,
)


# ── Helpers ─────────────────────────────────────────────────────────────────

def _mock_response(content: str, model: str = "test-model", status_code: int = 200) -> httpx.Response:
    """Build a mock httpx.Response."""
    body = {
        "model": model,
        "message": {"role": "assistant", "content": content},
        "total_duration": 1_000_000,
        "eval_count": 10,
    }
    resp = httpx.Response(
        status_code=status_code,
        json=body,
        request=httpx.Request("POST", "http://test/api/chat"),
    )
    return resp


def _simple_messages() -> list[ChatMessage]:
    return [ChatMessage(role="user", content="Hello")]


# ── Tests ───────────────────────────────────────────────────────────────────

class TestOllamaClientSuccess:
    """Successful chat completions."""

    def test_text_success(self):
        client = OllamaClient(base_url="http://test:11434")
        content = json.dumps({"answer": "42"})

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.return_value = _mock_response(content, "qwen3.5:2b")
            MockClient.return_value = mock_instance

            resp = client.chat(
                model="qwen3.5:2b",
                messages=_simple_messages(),
                is_vision=False,
            )

        assert resp.model == "qwen3.5:2b"
        assert resp.parsed_json == {"answer": "42"}

    def test_vision_success(self):
        client = OllamaClient(base_url="http://test:11434")
        content = json.dumps({"description": "A pothole"})

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.return_value = _mock_response(content, "gemma3:latest")
            MockClient.return_value = mock_instance

            resp = client.chat(
                model="gemma3:latest",
                messages=[ChatMessage(role="user", content="Describe", images=["base64data"])],
                is_vision=True,
            )

        assert resp.model == "gemma3:latest"
        assert resp.parsed_json["description"] == "A pothole"


class TestOllamaClientErrors:
    """Error handling."""

    def test_connection_refused(self):
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.side_effect = httpx.ConnectError("Connection refused")
            MockClient.return_value = mock_instance

            with pytest.raises(OllamaConnectionError):
                client.chat(
                    model="qwen3.5:2b",
                    messages=_simple_messages(),
                )

    def test_timeout(self):
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.side_effect = httpx.TimeoutException("Timeout")
            MockClient.return_value = mock_instance

            with pytest.raises(OllamaTimeoutError):
                client.chat(
                    model="qwen3.5:2b",
                    messages=_simple_messages(),
                )

    def test_model_not_found_404(self):
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            resp_404 = httpx.Response(
                status_code=404,
                text="model not found",
                request=httpx.Request("POST", "http://test/api/chat"),
            )
            mock_instance.post.return_value = resp_404
            MockClient.return_value = mock_instance

            with pytest.raises(OllamaModelNotFoundError):
                client.chat(
                    model="nonexistent",
                    messages=_simple_messages(),
                )

    def test_invalid_json_response(self):
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            resp_bad = httpx.Response(
                status_code=200,
                text="not json at all",
                request=httpx.Request("POST", "http://test/api/chat"),
            )
            mock_instance.post.return_value = resp_bad
            MockClient.return_value = mock_instance

            with pytest.raises(OllamaInvalidResponseError):
                client.chat(
                    model="test",
                    messages=_simple_messages(),
                )


class TestOllamaClientRetries:
    """Retry logic."""

    def test_text_retries_twice_then_succeeds(self):
        client = OllamaClient(base_url="http://test:11434")
        content = json.dumps({"ok": True})

        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count <= 2:
                raise httpx.ConnectError("retry me")
            return _mock_response(content)

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.side_effect = side_effect
            MockClient.return_value = mock_instance

            resp = client.chat(
                model="qwen3.5:2b",
                messages=_simple_messages(),
                is_vision=False,
            )

        assert resp.parsed_json == {"ok": True}
        assert call_count == 3  # 2 failures + 1 success

    def test_text_exhausts_retries(self):
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.side_effect = httpx.ConnectError("down")
            MockClient.return_value = mock_instance

            with pytest.raises(OllamaConnectionError):
                client.chat(
                    model="qwen3.5:2b",
                    messages=_simple_messages(),
                    is_vision=False,
                )

            # text = 2 retries → 3 total calls
            assert mock_instance.post.call_count == 3

    def test_vision_retries_once(self):
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.side_effect = httpx.TimeoutException("slow")
            MockClient.return_value = mock_instance

            with pytest.raises(OllamaTimeoutError):
                client.chat(
                    model="gemma3:latest",
                    messages=_simple_messages(),
                    is_vision=True,
                )

            # vision = 1 retry → 2 total calls
            assert mock_instance.post.call_count == 2


class TestQwenThinkStripping:
    """Qwen <think> block removal."""

    def test_strip_think_block(self):
        text = '<think>Some reasoning here...</think>{"answer": "42"}'
        result = _strip_thinking(text)
        assert result == '{"answer": "42"}'

    def test_strip_multiline_think(self):
        text = '<think>\nStep 1: ...\nStep 2: ...\n</think>\n{"result": "ok"}'
        result = _strip_thinking(text)
        assert result == '{"result": "ok"}'

    def test_no_think_block(self):
        text = '{"answer": "42"}'
        result = _strip_thinking(text)
        assert result == text

    def test_qwen_flag_disables_thinking(self):
        """Verify the client sends think=false for qwen models."""
        client = OllamaClient(base_url="http://test:11434")

        with patch("httpx.Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.__enter__ = MagicMock(return_value=mock_instance)
            mock_instance.__exit__ = MagicMock(return_value=False)
            mock_instance.post.return_value = _mock_response('{"ok": true}')
            MockClient.return_value = mock_instance

            client.chat(
                model="qwen3.5:2b",
                messages=_simple_messages(),
                is_qwen=True,
            )

            call_args = mock_instance.post.call_args
            payload = call_args.kwargs.get("json", call_args[1].get("json", {}))
            assert payload["options"]["think"] is False
