# Countries Data

`data/countries.json` must follow the contract in `data/dataset-spec.md`.

## Required Record Shape

Each item in the top-level JSON array must contain:

- `countryCode`
- `countryName`
- `flag`
- `primaryStatus`
- `operatingReactors`
- `reactorsUnderConstruction`
- `detailSummary`
- `latestNews`
- `sources`

`primaryStatus` must be one of these exact strings:

- `no nuclear program`
- `phase-out in progress`
- `phase-out completed`
- `nuclear ban reconsidered`
- `phase-out reverted`
- `nuclear expansion policy`
- `building new reactors`

## Update Rules For Future Agents

1. Read `data/dataset-spec.md` first and treat it as the schema authority.
2. Keep the file as a flat JSON array ordered alphabetically by `countryName`.
3. Preserve ISO alpha-2 uppercase `countryCode` values because the map and card focus logic use them directly.
4. Prefer IAEA PRIS for `operatingReactors` and `reactorsUnderConstruction`.
5. Prefer World Nuclear Association country profiles for status rationale. Use Reuters, AP, World Nuclear News, or official releases for fresher `latestNews` items when they materially improve the record.
6. Keep `latestNews` ordered newest first.
7. Every `sources` array must contain at least one source object with `title`, `url`, `publisher`, `accessedAt`, and `note`.
8. `detailSummary` should stay plain-text, short, and explicit about any classification compromise caused by the seven-status taxonomy.
9. If multiple statuses could apply, resolve `primaryStatus` with this precedence:
   `building new reactors` > `nuclear expansion policy` > `phase-out reverted` > `nuclear ban reconsidered` > `phase-out in progress` > `phase-out completed` > `no nuclear program`

## Practical Classification Guidance

The current schema is stricter than the real policy landscape. Some EU countries do not map cleanly into the seven buckets. When that happens:

- Use the closest UI status required by `data/dataset-spec.md`.
- Explain the approximation in `detailSummary`.
- Make the `sources.note` explicit about what is directly sourced and what is a taxonomy compromise.

## Suggested Refresh Workflow

1. Refresh PRIS operating counts from:
   `https://pris.iaea.org/PRIS/WorldStatistics/OperationalReactorsByCountry.aspx`
2. Refresh PRIS construction counts from:
   `https://pris.iaea.org/PRIS/WorldStatistics/UnderConstructionReactorsByCountry.aspx`
3. Re-check countries with active policy change risk:
   Belgium, Czech Republic, France, Hungary, Netherlands, Poland, Romania, Slovakia, Spain, Sweden.
4. Update `latestNews` only when the new item is clearly newer or more relevant.
5. Validate the file as JSON and confirm the app still renders all 27 countries.
