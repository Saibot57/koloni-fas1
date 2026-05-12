# Koloniträdgårdsplaneraren

Spatialt 2D-planeringsverktyg för köksträdgårdar.

## Status: FAS 1 — Verifiering & matematik

FAS 1 levererar **inte** en färdig produkt. FAS 1 levererar:

- Dokumentation av spatiala regler och scope
- ADR-dokument (arkitekturbeslut)
- `packages/spatial-core` — ren matematik (rotation, kollision, transforms, skugga)
- `apps/geometry-sandbox` — visuell verifieringsmiljö (React + Canvas)
- Tester för all spatial matematik

## Snabbstart

```bash
pnpm install
pnpm test                 # kör alla tester
pnpm dev:sandbox          # starta geometry-sandbox på http://localhost:5173
```

## Struktur

```
/docs                     spatiala regler, produkt-scope, state-arkitektur
/docs/adr                 arkitekturbeslut (immutable historik)
/packages/spatial-core    ren TypeScript-matematik, noll runtime-deps
/apps/geometry-sandbox    React + Canvas, importerar spatial-core
```

## Principer (kort)

1. Enkelhet före flexibilitet
2. Spatial stabilitet före features
3. Explicit matematik före "smart abstrahering"
4. Testbar logik före UI
5. 2D-first, permanent strategi

Se `docs/spatial_rules.md` för detaljer.
