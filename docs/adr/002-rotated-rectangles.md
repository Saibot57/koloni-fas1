# ADR-002: Endast roterade rektanglar i v1

- **Status:** Accepted
- **Datum:** 2025

## Kontext

Verkliga koloniträdgårdar kan innehålla L-formade bäddar, runda rabatter, slingrande
gångar. Vi övervägde:

1. Polygoner (godtyckliga konvexa eller t.o.m. konkava)
2. Cirklar + rektanglar
3. Endast roterade rektanglar (OBB)

## Beslut

**Endast roterade rektanglar i v1.**

Skäl:

- Overlap-test: SAT på rektanglar är 4 axlar, trivialt och snabbt.
- Skuggprojektion: 4 hörn → 8 punkter → konvext hylje. Stängd form.
- Areal & volym: `w * h * depth`, ingen integration.
- Användaren kan approximera L-formade bäddar med två rektanglar.

## Konsekvens

- En L-bädd är två objekt. Det är OK.
- Vi skjuter polygonstöd till tidigast FAS 3, om data visar att det behövs.
- Kollision mellan polygon och rektangel finns inte att skriva → ingen teknisk skuld.
