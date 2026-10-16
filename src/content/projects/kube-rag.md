---
title: "kube-rag: Agentic RAG over Kubernetes docs"
summary: LangGraph agent with NeMo guardrails, a Portkey LLM gateway with fallback, FlashRank reranking and a RAGAS eval dashboard.
stack: [Python, LangGraph, FastAPI, Qdrant, NeMo Guardrails, Portkey, RAGAS, Docker]
status: in-progress
order: 1
repo: https://github.com/shashankcm/kube-rag
---
## What it is
An agentic RAG service that answers questions about Kubernetes documentation. A planner node classifies each question, a retriever fetches and reranks context, and a responder writes the answer. Conversation memory is kept per thread.

## Architecture
- **Interface:** FastAPI `/query` endpoint, a Streamlit chat UI and a Streamlit eval dashboard.
- **Safety:** NeMo Guardrails block off-topic and jailbreak requests before they reach the agent.
- **Agent:** LangGraph with planner, retriever and responder nodes and `MemorySaver`.
- **Retrieval:** Qdrant vector search, then a local FlashRank cross-encoder reranks 15 candidates down to 5.
- **LLM gateway:** all generation goes through Portkey to Groq models, with a saved config for fallback, retry and caching.
- **Ingestion:** PDF, HTML, DOCX, PPTX and TXT loaders, chunking and indexing into Qdrant.
- **Observability:** Logfire spans and LangSmith traces.
- **Evaluation:** RAGAS metrics, tool correctness and a guardrail confusion matrix, run from a dashboard.
- **Ops:** Dockerfiles and docker-compose with an optional local Qdrant.

## Where it stands
The pipeline, guardrails, gateway and Docker setup work. I reviewed the project and found gaps I'm now fixing, and the numbers below will be filled in only after I run them.

| Next step | Why |
|---|---|
| Carry source metadata through to the answer | Enables citations and source-level metrics |
| Add an explicit "not enough context" path | Stops answers from falling back to model memory |
| Grow the golden set from 15 to 60+ questions with gold sources | 15 samples are too few to trust a metric |
| Parent-child chunking and BM25 + dense hybrid retrieval | The main retrieval upgrade |
| Compare before and after on the same golden set | Produces the measured result |

## Measured results
| Metric | Baseline (dense only) | Hybrid + parent-child |
|---|---|---|
| Recall@5 | not yet run | not yet run |
| MRR | not yet run | not yet run |
