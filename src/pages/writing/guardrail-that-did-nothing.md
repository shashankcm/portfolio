---
layout: ../../layouts/Base.astro
title: "My guardrail did nothing for weeks, and nothing I had written noticed"
---

The first screenshot I took for my portfolio showed the guardrail doing nothing. A joke request got a joke. A jailbreak phrase went straight through to the pipeline. The page said "Intent: Technical" where it should have said "Guardrails Fired".

I had written tests, a CI badge and a README. None of them had ever sent a jailbreak through the guardrail and checked the result.

## What it was supposed to do

The guardrail sits in front of my RAG service. It reads each message before retrieval and blocks two kinds of request: attempts to override the system's instructions, and off-topic questions. It is built on NeMo Guardrails, which asks a language model to classify each message into an intent. A matching rule then returns a fixed reply.

## How I found out

I traced the classification step with NeMo's own debugging output. The model was answering the question instead of naming an intent. A message like "tell me a joke" returned a joke, not the label that would fire the rule. No rule matched, so the request went through.

The damage went further. Each check cost three model calls, and a normal question generated a full answer inside the guardrail and threw it away. That was roughly 2,800 tokens per request, and it was the likely cause of a daily quota failure that had already cost me 28 of 75 evaluation requests. Those failures had been recorded as answers.

## The fix, and the number I should not have stopped at

I replaced the model call with embedding similarity. Each message is compared with the example phrases, and a threshold decides the match. The threshold came from a sweep, and I checked it on messages I wrote before looking at any result. On that set it blocked 10 of 10 jailbreaks and none of 20 legitimate questions, with zero model calls.

That set was small. When I built a larger one, 340 hand-written messages across four categories, the same threshold blocked only 64% of attacks on dev and 70% on test. Off-topic messages were largely missed.

I chose a new threshold, 0.41, using a rule I wrote down before the sweep. It blocks 97% of attacks on the test set, which is 29 of 30, with no legitimate questions wrongly blocked. Off-topic recall is still 23%. No threshold I tried fixed that, which tells me embedding similarity is the wrong tool for it.

## What I would tell another engineer

- **Measure guardrails in CI, not once by hand.** A change that makes the guardrail worse should fail the build.
- **A failed request is not a verdict.** Scoring an error as "not blocked" is how a broken guardrail looks like a working one.
- **Watch for a model answering instead of classifying.** Check the intent the guardrail actually produced, not only the final reply.
- **Be suspicious of a small set.** Ten examples told me the guardrail worked. Three hundred and forty told me it didn't.
- **Say what you could not fix.** Off-topic recall is still weak, and it stays on the limits list.

The measurement harness, the labelled data and the regression checks are in [guardrail-eval-ci](https://github.com/shashankcm/guardrail-eval-ci). The case study is on the [projects page](/projects/guardrail-eval-ci).
