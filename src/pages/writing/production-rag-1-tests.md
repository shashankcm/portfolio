---
layout: ../../layouts/Base.astro
title: "I wrote 56 tests for my own API, and they found four bugs"
---

[← All writing](/writing)

production-rag-1 is a FastAPI service that wraps an LLM agent in the parts a demo leaves out: rate limiting, injection and PII checks, a cache, a fallback model, and output validation. Its test files were empty when I started.

I wrote 56 tests for it. The model is replaced by a fake, so the tests need no API key. Writing them for code I had not tested turned up four defects, all fixed.

## The four bugs

**1. The fallback retry crashed.** The routing function could ask for another fallback attempt, but the graph had no edge for that case. With the default settings, the second fallback failure raised `KeyError: 'fallback'`, so the request crashed instead of failing cleanly.

**2. A total failure came back as an answer.** The error handler wrapped the exception text as a normal model message and cleared the error flag. The API returned HTTP 200 with internal error text, and the cache stored it. At the default retry limit the crash in bug 1 happened first, but a lower limit exposed this one.

**3. 500 responses leaked internals.** The handler returned the raw exception message to the caller.

**4. The Render configuration set the API keys to the string "false".** The config set `value: false`, which deploys the literal text "false" as the key, instead of prompting for the real value. It is now `sync: false`.

## Why the tests were the right tool

None of the four needed a live model to find. Each one is a path through the code that a fake model can force: a failing fallback, an exception, a retry limit. Tests that check the response shape and the failure paths are what catch bugs like 2 and 3.

## What the tests do not cover

- Two tests are strict expected failures. They record a safety pattern that blocks harmless questions about system prompts. I know about the over-blocking, and I have not fixed it.
- The service has no retrieval, despite the name. The agent calls the model directly.
- The cache and metrics live in memory, so they reset on restart and are not shared between instances.
- Security is pattern-based. It catches known phrasings, not new attacks.

## What I would tell another engineer

- Write tests for code you did not write, before you trust it. The defects were in my own code, and I had already reviewed it.
- Force the failure paths on purpose. Most of these bugs only appear when something goes wrong.
- Check your deployment config as carefully as your code. A string "false" in a config file passes every code test.

The code and the tests are in [production-rag-1](https://github.com/shashankcm/production-rag-1). The case study is on the [projects page](/projects/production-rag-1).
