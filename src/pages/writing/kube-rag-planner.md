---
layout: ../../layouts/Base.astro
title: "My planner made retrieval worse, and a paired test showed it"
---

[← All writing](/writing)

My RAG service has a planner step: an LLM rewrites each question before it goes to the vector database. It seemed like an obvious improvement. The rewrite adds context, so search should find more.

I measured it, and the rewrite made retrieval worse.

## The setup

The evaluation uses 65 labelled questions over six Kubernetes documents, mixed with about 60 unrelated files. For each question, the gold answer is a verbatim quote from a source document, checked by a script. A question is a hit when a chunk from the right document appears in the top five results.

## What the rewrite did

Searching with the rewritten question scored 0.969 hit@5 and 0.862 MRR. Searching with the user's own words on a first question scored 1.000 and 0.951, the same as the retriever alone.

The rewrites added generic words such as "Kubernetes documentation and usage guide". Those words pulled the right document down. In one example the correct document dropped from rank 1 to rank 2, behind a document about a different topic.

The comparison is paired: the same 65 questions, scored both ways. Searching with the user's own words gained +0.090 MRR, with a bootstrap interval of +0.038 to +0.144. On hit@5 the gain was +0.031, with an interval of 0.000 to +0.077, which is borderline.

## What I changed

On a first question, the retriever now searches with the user's own words. A follow-up question still uses the rewrite, because that is the reason the planner exists: it resolves references like "what about its limits?"

## What I did not fix

- **The rewrite output was often malformed.** 29 of 75 rewrites had duplicated text or stray null characters. I added a cleaner. It changed the query for 25 questions, but hit@5 stayed the same on all 65. The problem was the content of the rewrite, not its formatting.
- **One question got worse.** For "What is a CronJob?" the rewrite helped, so the change is better on net, not on every question.
- **Follow-ups are not measured.** The test set is single-turn, so the follow-up path, which is the reason for keeping the rewrite, has no measurement yet.

## What I would tell another engineer

- Measure the components that you think help. A planner step feels like it should help, and this one hurt.
- Compare on the same items. Paired intervals told me the difference was real even with 65 questions.
- Check your own changes against a baseline before you keep them. The simplest version, your user's own words, won.

The code and the saved runs are in [kube-rag](https://github.com/shashankcm/kube-rag). The case study is on the [projects page](/projects/kube-rag).
