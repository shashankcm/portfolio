---
title: "RAG Engineering Lab"
summary: Working modules for chunking, embeddings, vector stores, BM25 + dense hybrid search, cost control and tracing.
stack: [Python, LangChain, Chroma, pgvector, Supabase, LangSmith]
status: shipped
order: 3
repo: https://github.com/shashankcm/langc-project
---
## What it is
A hands-on lab where I built each layer of a RAG system separately and compared the options. It has 39 commits and about 2,200 lines of Python.

## Modules
- **Loaders and splitters:** document loading and text splitting strategies.
- **Chunking:** semantic chunking, plus a production-oriented variant.
- **Embeddings:** an embeddings deep dive.
- **Vector stores:** Chroma, and pgvector on Supabase with a production example.
- **Hybrid search:** BM25 and dense retrieval combined with weighted reciprocal rank fusion, implemented by hand and with LangChain's ensemble retriever.
- **RAG pipelines:** a basic pipeline and an advanced one.
- **Cost optimization:** a module for reducing LLM spend.
- **Monitoring:** LangSmith tracing and metrics.

## Why it matters
The hybrid search and chunking work here is the prototype for the retrieval upgrade in kube-rag.
