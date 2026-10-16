---
title: "production-rag-1: Hardened LLM API"
summary: FastAPI service that wraps an LLM agent in rate limiting, injection and PII checks, caching, retry with model fallback, and metrics.
stack: [Python, FastAPI, LangGraph, LangChain, Prometheus, Docker, Render]
status: shipped
order: 2
repo: https://github.com/shashankcm/production-rag-1
---
## What it is
A reference implementation of the production concerns that sit around an LLM call. Most demos stop at "call the model". This one handles what happens on a bad day.

## Request flow
1. **Rate limiter** (slowapi), 20 requests per minute by default.
2. **Security pipeline:** prompt-injection pattern checks and PII masking before text reaches the model.
3. **Response cache** with a time-to-live, so repeated questions skip the model.
4. **LLM agent** (LangGraph) with a primary model, retries, and a fallback model when the primary fails.
5. **Output validator** that checks the answer for PII and harmful patterns.
6. **Observability:** structured JSON logs and Prometheus counters and histograms.
7. JSON response.

## Deployment
Dockerfile, docker-compose and a `render.yml` for a free Render web service.

## Known limits
It is a pattern library for the API layer. There is no retrieval step yet, so the name "RAG" describes where it's headed. The test files exist but are still empty. Filling them in and adding retrieval are the next steps.
