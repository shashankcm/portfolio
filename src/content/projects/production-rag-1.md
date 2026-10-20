---
title: "production-rag-1: Hardened LLM API"
summary: A FastAPI service that wraps a LangGraph agent in rate limiting, injection and PII checks, a cache, model fallback and output validation, with tests that found real bugs.
stack: [Python, FastAPI, LangGraph, slowapi, pytest, Docker, Render]
status: shipped
order: 2
repo: https://github.com/shashankcm/production-rag-1
---
## The problem
A demo calls a model and prints the answer. A service has to cope with abuse, failures and sensitive data. I wanted a small reference for the layer around the model call.

## Request flow
1. **Rate limiter** (slowapi, 20 requests per minute per client by default).
2. **Input security:** prompt-injection patterns are rejected with a 400, and PII (email, phone, SSN, card, IP) is masked before the model sees it.
3. **Response cache** with a time-to-live, so a repeated question skips the model.
4. **LangGraph agent:** a primary model, then a fallback model retried up to a limit, then a clean failure.
5. **Output validation:** PII is masked and harmful patterns replace the whole answer, before anything is cached or returned.
6. **Metrics and structured JSON logs**, with a health check and Docker and Render deployment files.

## Tests found real bugs
I wrote 56 tests with the model replaced by a fake, so they need no API key. Writing them for code I had not tested turned up four defects, now fixed:

- **The fallback retry crashed.** The routing function could ask for another fallback attempt, but the graph had no edge for it, so the second failure raised `KeyError: 'fallback'` with the default settings.
- **A total failure came back as an answer.** The error handler wrapped the exception text as a normal model message and cleared the error flag, so the API returned 200 with internal error text, and cached it (reachable with a lower retry limit; at the default, the crash above happened first).
- **500 responses leaked internals.** The handler returned the raw exception message to the caller.
- **The Render config set the API keys to the string "false"** instead of prompting for them.

Two more tests are strict expected-failures that record known over-blocking, for example a safety pattern that also rejects harmless questions about system prompts.

## Limits
- **There is no retrieval yet.** Despite the name, the agent calls the model directly, and the conversation `thread_id` is accepted but not used.
- The cache and metrics are in memory, so they reset on restart and are not shared across instances.
- Security is pattern-based, so it catches known phrasings, not novel attacks.
