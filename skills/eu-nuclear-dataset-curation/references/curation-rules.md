# EU Nuclear Dataset Rules

## Scope

This skill is for `/Users/jona/eu_nuclear_status_dashboard`.

Primary files:

- `data/countries.json`
- `data/dataset-spec.md`
- `data/README.md`
- `assets/js/main.js`
- `assets/css/styles.css`

## Current Status Taxonomy

Allowed `primaryStatus` values:

1. `no nuclear program`
2. `phase-out in progress`
3. `phase-out completed`
4. `nuclear ban reconsidered`
5. `phase-out reverted`
6. `pro-nuclear policy`
7. `building new reactors`

## Status Precedence

When more than one label could apply, resolve to the strongest signal in this order:

1. `building new reactors`
2. `pro-nuclear policy`
3. `phase-out reverted`
4. `nuclear ban reconsidered`
5. `phase-out in progress`
6. `phase-out completed`
7. `no nuclear program`

Interpretation:

- `building new reactors`: active construction or a dataset decision that construction dominance should win
- `pro-nuclear policy`: credible entry, re-entry, expansion, or explicit pro-nuclear alignment without active construction
- `phase-out reverted`: a prior exit policy has been materially reversed
- `nuclear ban reconsidered`: an anti-nuclear or anti-reactor stance is being officially re-opened, but not yet clearly reversed
- `phase-out in progress`: reactors still operate under an active closure path
- `phase-out completed`: commercial nuclear generation ended after an actual phase-out
- `no nuclear program`: never had commercial nuclear generation and no current domestic build path

## Color Mapping

Keep app colors synchronized between `assets/js/main.js` and `assets/css/styles.css`.

Current mapping:

- `no nuclear program` = dark grey
- `phase-out in progress` = red
- `phase-out completed` = brown
- `nuclear ban reconsidered` = orange
- `phase-out reverted` = yellow
- `pro-nuclear policy` = light green
- `building new reactors` = dark green

## Source Hierarchy

Use sources in this order unless the task explicitly asks for another standard:

1. IAEA PRIS
   Use for `operatingReactors` and `reactorsUnderConstruction`.
2. World Nuclear Association country profiles
   Use for baseline country context and policy framing.
3. Reuters
   Prefer Reuters for country-specific policy shifts and `latestNews` when a relevant item exists.
4. AP, AFP, official government releases, or World Nuclear News
   Use when Reuters does not have a suitable country-specific item or when another source is more directly on point.

Useful source patterns:

- IAEA PRIS operational reactors by country
  `https://pris.iaea.org/PRIS/WorldStatistics/OperationalReactorsByCountry.aspx`
- IAEA PRIS under construction reactors by country
  `https://pris.iaea.org/PRIS/WorldStatistics/UnderConstructionReactorsByCountry.aspx`
- IAEA PRIS shutdown reactors by country
  `https://pris.iaea.org/PRIS/WorldStatistics/ShutdownReactorsByCountry.aspx`
- World Nuclear Association country profiles
  `https://world-nuclear.org/information-library/country-profiles/`

Reuters note:

- Check Reuters first for country-specific political or project updates.
- If Reuters has no suitable item, keep the stronger non-Reuters source already in the record rather than forcing a weak Reuters match.
- Syndicated Reuters copies are acceptable when the original Reuters URL is not readily available in search.

## Country Classification Conventions

Use these conventions unless the user explicitly overrides them:

- Countries with no commercial nuclear history and no domestic build path belong in `no nuclear program`.
- Countries that shut down an actual commercial program belong in `phase-out completed`.
- Countries with reactors still operating under a scheduled closure path belong in `phase-out in progress`.
- Countries officially reviewing or reopening an anti-nuclear stance belong in `nuclear ban reconsidered`.
- Countries that clearly reversed a former phase-out line belong in `phase-out reverted`.
- Countries with credible new-build, re-entry, expansion, or clear pro-nuclear alignment but no active construction belong in `pro-nuclear policy`.
- Countries with active construction, or where the maintained taxonomy deliberately treats building as dominant, belong in `building new reactors`.

## Triple Nuclear Energy Rule

Treat membership in the `Declaration to Triple Nuclear Energy` as a minimum signal for `pro-nuclear policy`.

Apply it like this:

- If a country has joined the declaration, it should be classified as at least `pro-nuclear policy`.
- If a stronger status already applies under the precedence rules, keep the stronger status.
- Because `pro-nuclear policy` outranks `phase-out reverted` in this taxonomy, declaration membership can lift a country out of the reversal bucket.
- When this rule is the main reason for the classification, say so explicitly in `detailSummary` or `sources.note`.

## EU Nuclear Alliance Rule

Treat membership in the `EU Nuclear Alliance` as a minimum signal for `pro-nuclear policy`.

Apply it like this:

- If a country is a member of the EU Nuclear Alliance, it should be classified as at least `pro-nuclear policy`.
- If a stronger status already applies under the precedence rules, keep the stronger status.
- Observer status alone is not the same as full membership.
- When alliance membership is the main reason for the classification, say so explicitly in `detailSummary` or `sources.note`.

Verified membership reference points used in this repo:

- Government of Sweden statement on the 16 June 2025 Nuclear Alliance meeting:
  `https://www.government.se/statements/2025/06/meeting-of-the-nuclear-alliance-in-the-margin-of-the-energy-council-june-16-2025/`
- Italy joining the alliance as a full member:
  `https://www.agenzianova.com/en/news/Pichetto-Italy-joins-the-European-nuclear-alliance/`

As verified from those sources during this repo update, the alliance member set relevant to EU classification was:

- Belgium
- Bulgaria
- Croatia
- Czech Republic
- Finland
- France
- Hungary
- Italy
- Netherlands
- Romania
- Slovakia
- Slovenia
- Sweden

Observer-only examples at that point:

- Poland
- Estonia

## Update Workflow

1. Read the current record in `data/countries.json`.
2. Verify whether the change is:
   - a factual country update
   - a taxonomy change
   - a presentation change
3. For factual updates:
   - update the country record
   - refresh `detailSummary`
   - refresh `latestNews` only if the new item is materially better
   - keep at least one source entry
4. For taxonomy changes:
   - update dataset values
   - update `data/dataset-spec.md`
   - update `data/README.md`
   - update `assets/js/main.js`
   - update `assets/css/styles.css`
5. Validate after edits.

## Validation Checklist

- `data/countries.json` parses as JSON
- exactly 27 EU countries are present
- records remain alphabetized by `countryName`
- every `primaryStatus` is allowed by the current spec
- every record has at least one source
- legend order and status validation in `assets/js/main.js` still match the spec

## Known Judgment Calls

- The taxonomy is political, not purely technical. Some classifications may intentionally reflect the app owner's framing rather than a strict PRIS-only reading.
- When that happens, keep the explanation explicit in `detailSummary` and `sources.note`.
