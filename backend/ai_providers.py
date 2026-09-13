"""Server-side AI adapters with retries, circuit breaking and JSON-only output."""
from dataclasses import dataclass, field
import json
import logging
import threading
import time
from urllib.parse import quote
import httpx
from . import config

LOGGER = logging.getLogger("dearuniverse.ai")


@dataclass(frozen=True)
class Provider:
    name: str
    model: str
    kind: str
    url: str
    api_key: str = field(default="", repr=False)


class ProviderFailure(Exception):
    def __init__(self, message, retryable=True, status=None):
        super().__init__(message)
        self.retryable = retryable
        self.status = status


class CircuitBreaker:
    def __init__(self, threshold=3, cooldown_seconds=300):
        self.threshold = threshold
        self.cooldown_seconds = cooldown_seconds
        self._lock = threading.Lock()
        self._failures = {}
        self._opened = {}

    def is_open(self, name):
        with self._lock:
            opened = self._opened.get(name)
            if opened is None:
                return False
            if time.monotonic() - opened >= self.cooldown_seconds:
                self._opened.pop(name, None)
                self._failures[name] = 0
                return False
            return True

    def failure(self, name):
        with self._lock:
            failures = self._failures.get(name, 0) + 1
            self._failures[name] = failures
            if failures >= self.threshold:
                self._opened[name] = time.monotonic()

    def success(self, name):
        with self._lock:
            self._failures[name] = 0
            self._opened.pop(name, None)

    def state(self, name):
        with self._lock:
            opened = self._opened.get(name)
            remaining = max(0, self.cooldown_seconds - (time.monotonic() - opened)) if opened else 0
            return {"open": bool(opened and remaining > 0),
                    "failures": self._failures.get(name, 0), "retry_in_seconds": round(remaining, 1)}

    def reset(self):
        with self._lock:
            self._failures.clear()
            self._opened.clear()


BREAKER = CircuitBreaker()
_METRICS_LOCK = threading.Lock()
_METRICS = {"success": {}, "failure": {}, "rate_limited": {}, "last_success": {},
            "cache": {"hit": 0, "miss": 0}, "rejected_output": {}}


def configured_providers():
    providers = []
    for index, key in enumerate(config.GROQ_API_KEYS):
        providers.append(Provider(f"groq_pool_{index + 1}", config.GROQ_MODEL, "openai",
                                  "https://api.groq.com/openai/v1/chat/completions", key))
    for index, key in enumerate(config.GEMINI_API_KEYS):
        providers.append(Provider(f"gemini_pool_{index + 1}", config.GEMINI_MODEL, "gemini",
            f"https://generativelanguage.googleapis.com/v1beta/models/{quote(config.GEMINI_MODEL, safe='-._')}:generateContent", key))
    if config.GEMINI_API_KEY:
        model = config.GEMINI_MODEL or "gemini-2.5-flash-lite"
        providers.append(Provider("gemini", model, "gemini",
                                  f"https://generativelanguage.googleapis.com/v1beta/models/{quote(model, safe='-._')}:generateContent",
                                  config.GEMINI_API_KEY))
    if config.GROQ_API_KEY:
        providers.append(Provider("groq", config.GROQ_MODEL or "openai/gpt-oss-20b", "openai",
                                  "https://api.groq.com/openai/v1/chat/completions", config.GROQ_API_KEY))
    if config.OPENROUTER_API_KEY:
        providers.append(Provider("openrouter", config.OPENROUTER_MODEL or "openrouter/free", "openai",
                                  "https://openrouter.ai/api/v1/chat/completions", config.OPENROUTER_API_KEY))
    for index, model in enumerate(config.AI_MODELS):
        providers.append(Provider(f"local_{index + 1}", model, "ollama", config.AI_URL))
    if config.POLLINATIONS_API_KEY:
        providers.append(Provider("pollinations", config.POLLINATIONS_MODEL, "openai",
                                  "https://gen.pollinations.ai/v1/chat/completions", config.POLLINATIONS_API_KEY))
    return providers


def provider_signature():
    return [f"{provider.name}:{provider.model}" for provider in configured_providers()]


def _metric(outcome, provider, status=None):
    with _METRICS_LOCK:
        bucket = _METRICS[outcome]
        bucket[provider] = bucket.get(provider, 0) + 1
        if outcome == "success":
            _METRICS["last_success"][provider] = time.time()
        if status == 429:
            limited = _METRICS["rate_limited"]
            limited[provider] = limited.get(provider, 0) + 1


def record_cache(hit):
    with _METRICS_LOCK:
        _METRICS["cache"]["hit" if hit else "miss"] += 1


def record_rejection(provider):
    with _METRICS_LOCK:
        bucket = _METRICS["rejected_output"]
        bucket[provider] = bucket.get(provider, 0) + 1


def _schema_format(schema):
    return {"type": "json_schema", "json_schema": {"name": "grounded_astrology",
            "strict": True, "schema": schema}}


def _body(provider, system, prompt, schema, max_tokens):
    if provider.kind == "gemini":
        return {"systemInstruction": {"parts": [{"text": system}]},
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.25, "maxOutputTokens": max_tokens,
                                     "responseMimeType": "application/json",
                                     "responseJsonSchema": schema}}
    if provider.kind == "ollama":
        return {"model": provider.model, "system": system, "prompt": prompt, "stream": False,
                "format": schema, "options": {"temperature": 0.25, "num_predict": max_tokens}}
    body = {"model": provider.model, "messages": [{"role": "system", "content": system},
            {"role": "user", "content": prompt}], "temperature": 0.25,
            "max_tokens": max_tokens, "response_format": _schema_format(schema)}
    if provider.name.startswith('groq') and 'gpt-oss' in provider.model:
        # Reasoning tokens count toward the completion budget. Tiny budgets can
        # truncate valid structured output and surface as HTTP 400 from Groq.
        body.pop('max_tokens')
        body['max_completion_tokens'] = max_tokens + 2048
        body['reasoning_effort'] = 'low'
    return body


def _headers(provider):
    if provider.kind == "gemini":
        return {"x-goog-api-key": provider.api_key}
    if provider.kind == "openai":
        headers = {"Authorization": f"Bearer {provider.api_key}"}
        if provider.name == "openrouter":
            headers.update({"HTTP-Referer": "https://antariksha.local", "X-Title": "Antariksha"})
        return headers
    return {}


def _extract(provider, payload):
    try:
        if provider.kind == "gemini":
            raw = "".join(part.get("text", "") for part in payload["candidates"][0]["content"]["parts"])
        elif provider.kind == "ollama":
            raw = payload["response"]
        else:
            raw = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise ProviderFailure("provider returned no usable content") from error
    if isinstance(raw, dict):
        return raw
    if not isinstance(raw, str):
        raise ProviderFailure('provider returned no text content')
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        value = json.loads(raw)
    except (json.JSONDecodeError, TypeError) as error:
        raise ProviderFailure("provider returned invalid JSON") from error
    if not isinstance(value, dict):
        raise ProviderFailure("provider JSON must be an object")
    return value


def _call(provider, system, prompt, schema, max_tokens):
    timeout = httpx.Timeout(config.AI_TIMEOUT_SECONDS, connect=min(3, config.AI_TIMEOUT_SECONDS))
    started = time.perf_counter()
    try:
        with httpx.Client(timeout=timeout) as client:
            response = client.post(provider.url, headers=_headers(provider),
                                   json=_body(provider, system, prompt, schema, max_tokens))
            response.raise_for_status()
            value = _extract(provider, response.json())
    except httpx.HTTPStatusError as error:
        status = error.response.status_code
        raise ProviderFailure(f"HTTP {status}", retryable=status == 429 or status >= 500, status=status) from error
    except (httpx.HTTPError, ValueError) as error:
        raise ProviderFailure(type(error).__name__) from error
    return value, round((time.perf_counter() - started) * 1000)


_COOLDOWNS = {}
_ROUTING_LOCK = threading.Lock()


def generate_json(system, prompt, schema, max_tokens=500, validator=None):
    """Return validated JSON source metadata, or None when every provider fails."""
    deadline = time.monotonic() + 32
    for provider in configured_providers():
        identity = f"{provider.name}:{provider.model}"
        family = provider.name.split("_pool_")[0]
        with _ROUTING_LOCK:
            cooling = _COOLDOWNS.get(family, 0) > time.monotonic() or _COOLDOWNS.get(identity, 0) > time.monotonic()
        if cooling or time.monotonic() > deadline:
            continue
        if BREAKER.is_open(identity):
            LOGGER.info("Skipping AI provider %s because its circuit is open", identity)
            continue
        failure = None
        for attempt in range(2):
            try:
                data, latency = _call(provider, system, prompt, schema, max_tokens)
                if validator:
                    try:
                        validator(data)
                    except (ValueError, KeyError, TypeError):
                        record_rejection(provider.name)
                        raise ProviderFailure("Output failed factual validation", retryable=False)
                BREAKER.success(identity)
                _metric("success", identity)
                LOGGER.info("AI provider succeeded provider=%s latency_ms=%s", identity, latency)
                return {"data": data, "source": provider.name, "model": provider.model, "latency_ms": latency}
            except ProviderFailure as error:
                failure = error
                LOGGER.warning("AI provider failed provider=%s attempt=%s status=%s reason=%s",
                               identity, attempt + 1, error.status, error)
                if error.status in (401, 403, 404):
                    with _ROUTING_LOCK:
                        _COOLDOWNS[identity] = time.monotonic() + 3600
                if error.status == 429:
                    # A key is not an independent quota. Stop the whole family,
                    # rather than using another key to bypass an account limit.
                    with _ROUTING_LOCK:
                        _COOLDOWNS[family] = time.monotonic() + 300
                    break
                if not error.retryable or attempt == 1:
                    break
                time.sleep(0.25)
        BREAKER.failure(identity)
        _metric("failure", identity, getattr(failure, "status", None))
    return None


def health(probe=False):
    rows = []
    for provider in configured_providers():
        identity = f"{provider.name}:{provider.model}"
        row = {"provider": provider.name, "model": provider.model, "configured": True,
               "circuit": BREAKER.state(identity)}
        if probe:
            schema = {"type": "object", "properties": {"ok": {"type": "boolean"}},
                      "required": ["ok"], "additionalProperties": False}
            started = time.perf_counter()
            try:
                data, _ = _call(provider, "Return the requested JSON only.", "Return {\"ok\": true}.", schema, 200)
                row.update(reachable=data.get("ok") is True,
                           latency_ms=round((time.perf_counter() - started) * 1000))
            except ProviderFailure as error:
                row.update(reachable=False, error=f"HTTP {error.status}" if error.status else str(error))
        rows.append(row)
    with _METRICS_LOCK:
        metrics = json.loads(json.dumps(_METRICS))
    total_cache = metrics["cache"]["hit"] + metrics["cache"]["miss"]
    metrics["cache"]["hit_rate"] = (round(metrics["cache"]["hit"] / total_cache, 4)
                                            if total_cache else None)
    return {"ready": any(row.get('reachable') for row in rows) if probe else bool(rows), "readiness_verified": probe, "order": [row["provider"] for row in rows],
            "providers": rows, "metrics_since_restart": metrics,
            "fallback": "template", "probed": probe}
