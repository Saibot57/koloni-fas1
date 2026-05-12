# ADR-001: 2D-first som permanent strategi

- **Status:** Accepted
- **Datum:** 2025
- **Beslutstagare:** Projektägare

## Kontext

Det är frestande att designa data och matematik så att en framtida 3D-version
"bara skulle behöva en ny renderer". Det är nästan alltid en fälla:

- 3D-koordinater kräver höjd, normaler, kamera, projektioner — saker som inte
  motsvaras 1-till-1 i 2D.
- Att förbereda för 3D innebär abstraktioner som gör 2D-koden svårare att läsa.
- Vi har inget bekräftat användningsfall för 3D. Användaren vill planera en
  trädgård uppifrån.

## Beslut

**Koloniträdgårdsplaneraren är 2D, permanent.** All matematik antar
`(x, y) ∈ ℝ²`. Inga `z`-fält, inga "future-proof"-abstraktioner.

`wallHeight` är ett *skalärt attribut* för skuggberäkning, inte en ny dimension.

## Konsekvens

- Enklare kod, färre tester.
- Snabbare leverans.
- Om 3D någonsin krävs: skriv en ny applikation.
