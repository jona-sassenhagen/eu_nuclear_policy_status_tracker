# EU Nuclear Status Dashboard

Static dashboard for tracking where EU member states stand on nuclear power.

The app has two views:

- `index.html`: geographic dashboard
- `sources.html`: country-by-country source directory

## Project Structure

- `data/countries.json`: primary dataset consumed by the app
- `data/dataset-spec.md`: dataset contract
- `data/README.md`: dataset maintenance notes
- `assets/js/main.js`: rendering, validation, theme toggle, and status color logic
- `assets/css/styles.css`: visual system and theming
- `skills/eu-nuclear-dataset-curation/`: reusable skill for maintaining the dataset and taxonomy

## Current Status Taxonomy

- `no nuclear program`
- `phase-out in progress`
- `phase-out completed`
- `nuclear ban reconsidered`
- `phase-out reverted`
- `pro-nuclear policy`
- `building new reactors`

## Run Locally

This repo is static HTML/CSS/JS. Serve it with any local file server from the repo root.

Examples:

```bash
python3 -m http.server 8000
```

Then open:

- `http://127.0.0.1:8000/index.html`
- `http://127.0.0.1:8000/sources.html`

## Updating The Data

If you are updating the country data or taxonomy:

1. Read `data/dataset-spec.md`
2. Update `data/countries.json`
3. If statuses, precedence, or colors changed, also update:
   - `data/README.md`
   - `assets/js/main.js`
   - `assets/css/styles.css`

For the full maintenance workflow, source hierarchy, and classification rules, use:

- `skills/eu-nuclear-dataset-curation/SKILL.md`
- `skills/eu-nuclear-dataset-curation/references/curation-rules.md`

## Notes

- The dashboard supports light and dark mode.
- The “as of” date on the dashboard is derived from the latest date found in the dataset sources/news metadata.
