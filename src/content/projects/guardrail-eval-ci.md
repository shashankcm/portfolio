---
title: "guardrail-eval-ci: Measured guardrail evaluation in CI"
summary: "A CI-enforced evaluation of an LLM input guardrail. On a labelled test set it blocks 97% of attacks (n=30, read twice, not blind), with zero legitimate questions wrongly blocked, and it reports the weak spot: off-topic recall is 23%."
stack: [Python, NumPy, FastEmbed, GitHub Actions, pytest]
status: shipped
order: 4
repo: https://github.com/shashankcm/guardrail-eval-ci
---
## The problem
A guardrail that nobody measures can fail silently. kube-rag's guardrail did nothing for weeks, and no test ever ran it on labelled data. I wanted a repeatable measurement that runs on every change, so a change that makes the guardrail worse fails the build.

## What it is
A standalone reimplementation of NeMo Guardrails' `embeddings_only` mode, the same model (FastEmbed `all-MiniLM-L6-v2`) and the same 44 example phrases as kube-rag. It has a labelled dataset of 235 dev and 105 test messages in four categories (attack, off-topic, legitimate, and Kubernetes-adjacent hard negatives), metrics with confidence intervals, a threshold sweep, and regression checks that run in GitHub Actions without secrets.

## How I measured it
- **Parity with NeMo first.** Before trusting the reimplementation, I checked it against 100 similarity scores that NeMo logged itself. The largest difference is 1.4 × 10⁻⁷.
- **A failed request is never a verdict.** A broken call is recorded as failed and left out of every rate. kube-rag's first API run had scored 28 quota failures as answers.
- **Thresholds chosen on dev, under a rule written in advance.** The rule was: highest attack block rate with legitimate false blocks at most 0.02 and hard-negative false blocks at most 0.10. It selected a threshold of 0.41.
- **Paired comparisons.** Two thresholds are compared on the same items, with a bootstrap interval on the per-item differences.
- **CI cannot leak the test split.** The regression check re-scores dev and checks committed results, and it never scores the test split.

## Results
Rates are shares of scored items, with 95% Wilson intervals.

| | Dev | Test |
|---|---|---|
| Attacks blocked, threshold 0.45 (kube-rag reference) | 0.643 [0.526, 0.745], n=70 | 0.700 [0.521, 0.833], n=30 |
| Attacks blocked, threshold 0.41 (chosen on dev) | 0.857 [0.757, 0.921], n=70 | 0.967 [0.833, 0.994], n=30 |
| Off-topic blocked, 0.41 | 0.286 [0.193, 0.401], n=70 | 0.233 [0.118, 0.409], n=30 |
| Legitimate wrongly blocked, 0.41 | 0.014 [0.003, 0.077], n=70 | 0.000 [0.000, 0.114], n=30 |
| Hard negatives wrongly blocked, 0.41 | 0.080 [0.022, 0.250], n=25 | 0.000 [0.000, 0.204], n=15 |

On the same 105 test items, 0.41 was better than 0.45 on 12 items and worse on none. The mean gain is 0.114, with a bootstrap interval of [0.057, 0.181].

## Limits
- **One author wrote and labelled every message**, with an AI assistant helping. No second labeller has checked the labels, and the verifier checks format and leakage but not whether a label is correct.
- **The test split was not blind.** The author wrote it in the same session as the dev split. It has been read twice, at 0.45 and at 0.41, and both reads are logged in the repository.
- **Small test set.** Thirty attacks means one message moves the rate by about three points.
- **The chosen threshold is fragile.** It rests on one or two dev items. At 0.40, one more legitimate message is blocked.
- **Off-topic recall is weak.** No threshold in the grid fixes it, which points to embedding similarity as the wrong tool for off-topic detection.
- **It covers intent matching only**, not the full kube-rag guardrail or its answer step. The LLM-judged arm was planned but is not built.

## What I would do next
A second labeller on a sample of the labels, a harder paraphrase set, and an LLM classifier arm to compare off-topic recall against the embedding gate.
