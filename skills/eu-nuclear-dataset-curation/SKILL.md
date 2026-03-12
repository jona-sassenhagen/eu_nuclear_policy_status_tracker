---
name: eu-nuclear-dataset-curation
description: Maintain the EU nuclear status dashboard dataset in data/countries.json. Use this skill when adding or revising EU country classifications, reactor counts, colors/status rules, source notes, or dataset documentation for this app.
---

# EU Nuclear Dataset Curation

Use this skill when the task is to update the EU nuclear dashboard dataset or its classification rules.

## What To Read First

1. `data/dataset-spec.md`
2. `data/countries.json`
3. `data/README.md`
4. `references/curation-rules.md` in this skill

Read the app code only if the task changes status labels, colors, legend order, or validation:

- `assets/js/main.js`
- `assets/css/styles.css`

## Workflow

1. Read the current dataset contract in `data/dataset-spec.md`.
2. Read the taxonomy, precedence, and source hierarchy in `references/curation-rules.md`.
3. Update `data/countries.json` first. Keep it alphabetized by `countryName`.
4. If statuses, precedence, or meanings change, update:
   - `data/dataset-spec.md`
   - `data/README.md`
   - `assets/js/main.js`
   - `assets/css/styles.css`
5. Validate:
   - JSON parses
   - all `primaryStatus` values are allowed
   - 27 EU member states are present
   - every country has at least one source
   - status labels in the dataset, legend, and validation logic still match

## Non-Negotiables

- Treat `data/dataset-spec.md` as the schema authority.
- Keep `latestNews` newest first.
- Prefer exact dates in `YYYY-MM-DD`.
- Do not invent reactor construction status. If the taxonomy choice is broader than PRIS construction counts, explain the compromise in `detailSummary` and `sources.note`.
- When multiple statuses could apply, use the precedence from `references/curation-rules.md`.

## When To Touch App Code

Only update app code when the task changes one of these:

- the allowed status list
- status precedence
- legend order
- status colors
- status validation behavior
- theme treatment of status colors

For ordinary factual country updates, only change `data/countries.json`.
