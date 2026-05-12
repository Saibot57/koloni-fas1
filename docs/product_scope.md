# Product Scope — MVP

## Vision

Ett spatialt 2D-planeringsverktyg som hjälper en hobbyodlare att layouta sin
koloniträdgård innan spaden går i jorden.

## In-scope (MVP, post-FAS-1)

- Rita en **tomt** (yttre rektangel).
- Placera **odlingsbäddar** som roterade rektanglar.
- Beräkna **jordvolym** = bredd × höjd × bäddhöjd.
- Beräkna **direkt solljus per bädd** över en dag (timmar/dag).
- Visualisera **skuggor** från väggar och spaljéer per timme.
- Spara/läsa layouten lokalt (JSON, file → senare).

## Explicit ut-scope

- ❌ CAD-funktionalitet (curves, splines, dimensions, BOM)
- ❌ 3D-rendering eller 3D-data
- ❌ Generell geometry-engine eller plugin-arkitektur
- ❌ Biologisk simulering (växttillväxt, sjukdomar, näring)
- ❌ Multi-user / sync / cloud
- ❌ Auth / konton
- ❌ Backend-server, databas
- ❌ Mobil-app (responsiv webb är OK)
- ❌ Polygoner, cirklar, fri-form (endast roterade rektanglar)
- ❌ Reflekterat eller diffust ljus
- ❌ Mature plant height i skuggmodell (v1)

## FAS 1 ut-scope (vad som inte görs förrän FAS 2)

- Persistence layer
- Auth
- API-server
- Databas
- Polygonstöd
- Plant catalog & companion planting
- Färdig produkt-UI

## Användarberättelser för MVP (post-FAS-1)

1. Som odlare vill jag rita min tomts gränser så att jag har en arbetsyta.
2. Som odlare vill jag placera bäddar och rotera dem fritt.
3. Som odlare vill jag se hur mycket jord jag behöver beställa.
4. Som odlare vill jag se vilka bäddar som får > 6 timmar sol/dag i juni.
5. Som odlare vill jag se var skuggan från min friggebod hamnar kl 14 i augusti.

## Definition av "bra nog"

- Skuggor ±15 minuter mot verkligheten är acceptabelt.
- Solljustimmar ±30 minuter mot verkligheten är acceptabelt.
- Layoutens dimensioner exakta i mm.
