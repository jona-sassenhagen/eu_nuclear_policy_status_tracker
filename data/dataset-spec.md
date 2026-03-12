# Dataset Specification

This document defines the JSON contract for the EU nuclear status dashboard.

## File

Primary dataset path:

`data/countries.json`

The file must contain a JSON array with one object per EU member state.

## Record shape

Each country object must follow this shape:

```json
{
  "countryCode": "DE",
  "countryName": "Germany",
  "flag": "🇩🇪",
  "primaryStatus": "phase-out completed",
  "operatingReactors": 0,
  "reactorsUnderConstruction": 0,
  "detailSummary": "Optional short summary for the dashboard card.",
  "latestNews": [
    {
      "title": "Germany completes nuclear phase-out",
      "url": "https://example.com/article",
      "publishedAt": "2024-01-15"
    }
  ],
  "sources": [
    {
      "title": "IAEA Country Nuclear Power Profile",
      "url": "https://example.com/source",
      "publisher": "IAEA",
      "accessedAt": "2026-03-12",
      "note": "Explains the rationale for the displayed status."
    }
  ]
}
```

## Required fields

- `countryCode`: ISO 3166-1 alpha-2 uppercase code. Must be unique.
- `countryName`: display name used across the UI.
- `flag`: country flag string shown on dashboard cards.
- `primaryStatus`: one of:
  - `no nuclear program`
  - `phase-out in progress`
  - `phase-out completed`
  - `nuclear ban reconsidered`
  - `phase-out reverted`
  - `pro-nuclear policy`
  - `building new reactors`
- `operatingReactors`: integer `>= 0`
- `reactorsUnderConstruction`: integer `>= 0`
- `detailSummary`: short plain-text summary for the dashboard card.
- `latestNews`: array ordered newest first.
- `sources`: array with at least one source entry.

## News entry

- `title`: short display label
- `url`: absolute URL
- `publishedAt`: `YYYY-MM-DD`

## Source entry

- `title`: source title
- `url`: absolute URL
- `publisher`: publisher or institution name
- `accessedAt`: `YYYY-MM-DD`
- `note`: short explanation of why this source supports the status

## Ordering

- Include all 27 current EU member states.
- Use one record per country.
- Keep alphabetical ordering by `countryName` to make diffs predictable.
- Keep `latestNews` ordered newest first.

## Status precedence

If multiple labels could plausibly apply to one country, set `primaryStatus` using this precedence:

1. `building new reactors`
2. `pro-nuclear policy`
3. `phase-out reverted`
4. `nuclear ban reconsidered`
5. `phase-out in progress`
6. `phase-out completed`
7. `no nuclear program`

## Bootstrap scaffold

The initial repository seed may use placeholder values so the UI can render before curated data is added. Replace all placeholder text and URLs before treating the dataset as production-ready.
