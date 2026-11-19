# Offline Research Brief Workflow

Run from the repository root: `node src/agent/run-agent.mjs`.

This deterministic controller searches a fixed source pack, reads three sources, writes a template-based brief and validates it. It does not call an LLM. Compare `runs/max_steps_3` and `runs/max_steps_6`; summary: `evaluation.csv`.

Every tool call consumes one step. Post-run audit is recorded separately. Negative controls reject invalid citations and missing read lineage. This structural validator does not establish arbitrary semantic truth. Source provenance and original publication links are preserved in the data files.
