# AT3 Preference Alignment Experiments

Course: 數據科學前沿分析研究

## Run
Node.js 18+, no dependencies, API, GPU or runtime network.

    node run.mjs
    node 03-agent/run-agent.mjs

The first command reproduces the DPO objective on four synthetic two-action policies; it is not LLM fine-tuning. The second runs a self-authored deterministic tool controller, comparing max_steps=3 and 6. It is not a teacher fixture or model inference.

See results/summary.json and 03-agent/evaluation.csv. Complete per-run calls and observations are under 03-agent/runs. Sources are AI-assisted paraphrases with original-publication attribution.

screenshots contains actual process-output JSON and rendered result-page images. The images are not terminal-window screenshots. Code and writing were AI-assisted; outputs were actually executed locally.

Repository: https://github.com/thinkerbob/at3-preference-alignment (private).
