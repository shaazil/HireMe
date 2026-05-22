"""
AI provider abstraction layer.
Defaults to Gemini; designed so OpenAI can be swapped in later.
"""

import json
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.api_core.exceptions import GoogleAPIError

from utils.config import get_settings

logger = logging.getLogger(__name__)

# Lazy-import to avoid crashing if the key is not set
_gemini_model = None


def _get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai

        settings = get_settings()
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-2.0-flash")
    return _gemini_model


def _text_fallback(retry_state):
    return _fallback_response(retry_state.args[0])

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((GoogleAPIError, ConnectionError, TimeoutError)),
    retry_error_callback=_text_fallback
)
async def generate_text(prompt: str, system_instruction: str = "") -> str:
    """Generate text from a prompt using the configured AI provider."""
    try:
        model = _get_gemini_model()
        full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        return _fallback_response(prompt)


def _json_fallback(retry_state):
    return {}

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((GoogleAPIError, ConnectionError, TimeoutError, json.JSONDecodeError)),
    retry_error_callback=_json_fallback
)
async def generate_json(prompt: str, system_instruction: str = "") -> dict:
    """Generate structured JSON from a prompt."""
    try:
        model = _get_gemini_model()
        full_prompt = (
            f"{system_instruction}\n\n{prompt}\n\n"
            "Respond ONLY with valid JSON, no markdown fences or extra text."
        )
        response = model.generate_content(full_prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except json.JSONDecodeError:
        logger.warning("AI returned non-JSON, raising for retry")
        raise
    except Exception as e:
        logger.error(f"AI JSON generation failed: {e}")
        raise


def is_available() -> bool:
    """Check if the AI provider is configured and usable."""
    settings = get_settings()
    return bool(settings.GEMINI_API_KEY)


def _fallback_response(prompt: str) -> str:
    """Fallback when AI is unavailable — returns a reasonable default."""
    return (
        "Thank you for your response. I've noted your answer and will "
        "evaluate it as part of your overall assessment."
    )
