---
title: "RAG Engineering Lab"
summary: "Working demos of chunking, embeddings, vector stores, BM25 + dense hybrid search, cost control and tracing. Hybrid search is tested and was measured against dense-only search on 65 labelled questions, with no reliable gain."
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
- **Hybrid search:** BM25 and dense retrieval combined with weighted reciprocal rank fusion, through LangChain's ensemble retriever. A hand-written fusion function is tested but not used in search. Measured below.
- **RAG pipelines:** a basic pipeline and an advanced one.
- **Cost optimization:** a module for reducing LLM spend.
- **Monitoring:** LangSmith tracing and metrics.

## Tests and a measured result
The hybrid search module has 18 offline tests, run in GitHub Actions with no API key. I compared hybrid search with dense-only search on the 65 answerable questions from the kube-rag golden set. Both use the same chunks and the same embedding model, and the hybrid weight (0.5) was fixed in advance.

| Metric (k=5) | Dense only | Hybrid | Hybrid minus dense, 95% interval |
|---|---|---|---|
| hit@5 | 0.969 | 0.969 | +0.000 [−0.062, +0.062] |
| MRR@5 | 0.870 | 0.906 | +0.037 [−0.034, +0.110] |

**Result: no reliable gain.** The MRR difference is not significant: its interval includes zero, and the two methods beat each other on similar numbers of questions (10 better, 8 worse).

Limits: 65 questions, with hit@5 already close to its ceiling. One corpus. The embedding model is all-MiniLM-L6-v2, not the mpnet model kube-rag uses, so the dense baseline is not comparable with kube-rag's. The gold labels come from kube-rag's golden set. The other demos (chunking, pipelines, cost control) have not been measured.
