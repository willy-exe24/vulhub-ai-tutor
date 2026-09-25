import json
import re

from app.config import settings


class ProviderError(Exception):
    """Raised when a provider is unconfigured or a request to it fails."""


def is_configured(provider: str) -> bool:
    if provider == "openai":
        return bool(settings.openai_api_key)
    if provider == "anthropic":
        return bool(settings.anthropic_api_key)
    return False


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ProviderError(f"AI response was not valid JSON: {exc}") from exc


def _call_openai(system_prompt: str, messages: list[dict], json_mode: bool) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    kwargs = {"response_format": {"type": "json_object"}} if json_mode else {}
    try:
        resp = client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "system", "content": system_prompt}, *messages],
            **kwargs,
        )
    except Exception as exc:  # openai's SDK raises its own exception hierarchy
        raise ProviderError(f"OpenAI request failed: {exc}") from exc
    return resp.choices[0].message.content or ""


def _call_anthropic(system_prompt: str, messages: list[dict], json_mode: bool) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    prompt = system_prompt
    if json_mode:
        prompt += "\n\nRespond with ONLY a single JSON object as plain text. No markdown fences, no commentary."
    try:
        resp = client.messages.create(
            model=settings.anthropic_model,
            system=prompt,
            max_tokens=2048,
            messages=messages,
        )
    except Exception as exc:
        raise ProviderError(f"Anthropic request failed: {exc}") from exc
    return "".join(block.text for block in resp.content if block.type == "text")


def complete(provider: str, system_prompt: str, messages: list[dict], *, json_mode: bool = False) -> str:
    if not is_configured(provider):
        raise ProviderError(f"{provider} is not configured (no API key set in backend/.env)")
    if provider == "openai":
        return _call_openai(system_prompt, messages, json_mode)
    if provider == "anthropic":
        return _call_anthropic(system_prompt, messages, json_mode)
    raise ProviderError(f"Unknown AI provider: {provider}")


def complete_json(provider: str, system_prompt: str, messages: list[dict]) -> dict:
    text = complete(provider, system_prompt, messages, json_mode=True)
    return _extract_json(text)
