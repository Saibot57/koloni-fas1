# ADR-003: Ignorera mature_plant_height i v1

- **Status:** Accepted
- **Datum:** 2025

## Kontext

Mogna växter (solrosor, majs, hallon) kastar betydande skugga. Att modellera detta
korrekt kräver:

- En växtkatalog med höjder per art och tidpunkt på säsongen.
- Höjdtillväxt över tid (kurva, inte konstant).
- Variabilitet i jordens näring, soltimmar, sort, väder.

Det ligger nära "biologisk simulering" som vi explicit inte bygger.

## Beslut

**`mature_plant_height` används inte i skuggberäkningar i v1.**

Endast `wallHeight` på rektanglar (väggar, spaljéer, växthus, friggebodar) ger skugga.

## Konsekvens

- Användaren kan modellera en hallon-rad genom att placera en "vägg"-rektangel med
  manuellt satt `wallHeight`.
- Ingen plant catalog krävs i FAS 1 eller MVP.
- När vi får riktiga användardata kan vi återbesöka detta i ny ADR.
