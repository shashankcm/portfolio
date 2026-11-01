---
title: "MLOps release pipeline for a small LLM"
summary: "A planned project: versioned model releases with an evaluation gate, quantized serving, monitoring, and one-command rollback. Not started. No results yet."
stack: [MLflow, vLLM, Docker, GitHub Actions, Prometheus, Grafana]
status: planned
order: 5
---
## The problem
A model change, such as new weights, a quantization step or a changed prompt, can reach production without a quality check, without a record of what changed, and without a clean way back. This project is about making a model release as controlled as a code release.

## What I plan to build
- **Versioned releases.** Every candidate model is logged and registered in MLflow with its settings and evaluation results.
- **Quantized serving.** A small open model, served behind an OpenAI-compatible API in a container, compared in full precision and 4-bit.
- **An evaluation gate in CI.** A GitHub Actions job runs a labelled evaluation set on each candidate. Promotion is blocked if quality or latency falls below agreed floors. The gate follows the same pattern as [guardrail-eval-ci](/projects/guardrail-eval-ci).
- **Monitoring.** Prometheus metrics for latency, tokens per second and error rate, shown on a Grafana dashboard, with an alert when a release regresses.
- **Rollback.** Promoting the previous registered version, tested before the first real release.

## How I plan to measure it
- A baseline first, saved before any change.
- Paired comparisons on the same items, with intervals and sample sizes.
- Latency and throughput reported with the hardware named. A free Colab or Kaggle GPU may be too limited to show these numbers reliably, so a rented GPU may be needed.

## Limits I expect
- A small model on a single GPU, not production traffic.
- Evaluation sets I write myself, labelled by one person, as in the guardrail project.
- Numbers are only published once they have been measured.
