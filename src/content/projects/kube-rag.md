---
title: "kube-rag: Agentic RAG, measured"
summary: A LangGraph RAG service over Kubernetes docs whose retrieval is evaluated with no LLM judge, paired confidence intervals and a regression-tested golden set.
stack: [Python, LangGraph, FastAPI, Qdrant, FlashRank, NeMo Guardrails, Portkey, pytest, GitHub Actions]
status: shipped
order: 1
repo: https://github.com/shashankcm/kube-rag
---
## The problem
Most RAG demos stop at "it answers questions". I wanted to know whether each part of the pipeline actually helps, and to catch it when a change makes things worse.

## What it is
An agentic RAG service over Kubernetes documentation: a planner classifies each question, a retriever pulls 15 candidates from Qdrant and a cross-encoder reranks them to 5, and a responder answers through an LLM gateway with fallback. NeMo Guardrails sit in front, with tracing in Logfire and LangSmith.

## How I measured it
- **A 65-question golden set** over six documents mixed with about 60 unrelated distractor files, plus 10 questions the corpus cannot answer.
- **No LLM judge for retrieval.** A question is a hit when a chunk from a gold source file is in the top 5. Every label is backed by a verbatim quote, and a test checks each quote against the parsed source, so a label can never claim something the source does not say.
- **Paired comparisons.** Two configurations are compared on the same questions with a bootstrap 95% interval, which is more sensitive than comparing two separate intervals.
- **Failures are data, not answers.** A rate-limited LLM call is recorded as failed and left out of the metrics. The runner retries, stops after repeated failures, and resumes.

## Results

| Configuration | hit@5 | MRR@5 |
|---|---|---|
| Retriever only, with reranker | 1.000 | 0.951 |
| Retriever only, no reranker | 0.923 | 0.845 |
| Planner always rewrites the query (previous behaviour) | 0.969 | 0.862 |
| Planner, own words on a first question (current) | 1.000 | 0.951 |
| Full API with guardrails and answer | 0.969 | 0.869 |

- **The reranker helps:** +0.077 hit@5 (95% CI +0.015 to +0.138) and +0.106 MRR (CI +0.026 to +0.188), paired on the same questions.
- **The planner's query rewrite hurt.** It padded questions with generic words, pushing the right document from rank 1 to rank 2. Searching with the user's own words on a first question recovered +0.090 MRR (CI +0.038 to +0.144).
- **Repairing the rewrite's malformed output changed nothing.** 29 of 75 rewrites had duplicated text or stray null characters, but cleaning them left hit@5 unchanged. The content of the rewrite was the problem, not its formatting.
- **The prompt handles unanswerable questions better than a score threshold would.** 9 of 10 were refused, including three with very high retrieval scores. The one failure adapted an egress NetworkPolicy example into an ingress one using outside knowledge.

## Engineering that made the numbers trustworthy
- Found that a large daily token limit on the guardrail model had silently failed 28 of 75 requests, because the API returns HTTP 200 on errors and my first runner scored them as answers. That is how a "0% refusal rate" almost got reported.
- Found two gold labels that were incomplete when the retriever returned a document that also held the answer. Fixed them, recorded the change in the dataset's changelog, and rescored every saved run offline.
- Made the embedding libraries load lazily, so the test suite runs in a few seconds with no PyTorch, no API keys and no `.env`. 92 tests, run in GitHub Actions.
- CI also checks that committed results use the current gold labels and stay above a conservative floor, because it cannot re-run retrieval itself.

## Limits
- 65 questions, written by reading the documents, so many are near-verbatim lookups. A hit@5 of 1.000 means the set can no longer separate good from better, not that retrieval is perfect.
- Single-turn only: whether keeping the planner's rewrite for follow-up questions helps is not measured.
- Refusal is measured on 10 questions, so the interval is wide.
- Answer quality (faithfulness) has not been run on this golden set.

## What I would do next
Write a multi-turn test set, add harder paraphrased and exact-identifier questions, then test parent-child chunking (large pages are stored as single chunks) and BM25 hybrid search against this baseline. The weak spots, not a bigger headline number, decide what to build.
