# ADR-004: Inget state management library i frontend

- **Status:** Accepted
- **Datum:** 2025

## Kontext

React-ekosystemet har Redux, Zustand, Jotai, Recoil, MobX, Valtio, etc. Varje val
medför inlärningskurva, debugger-konfiguration, persistens-plugin, devtools.

FAS 1 handlar om spatial matematik. Frontend-state är trivial: en lista rektanglar,
ett urval, en viewport.

## Beslut

**Använd endast Reacts inbyggda primitiver:**

- `useState` för enkla värden.
- `useReducer` för actions/transitions (t.ex. "addRect", "moveRect", "rotateRect").
- `React.Context` om — och bara om — prop drilling blir > 3 nivåer.

**Inget tredjeparts state library i FAS 1 eller MVP.**

## Konsekvens

- Lättare onboarding för bidragsgivare.
- Inga devtools-beroenden.
- Om FAS 2 visar äkta behov (t.ex. cross-window sync, time-travel debugging
  med externt verktyg) — då skriver vi en ny ADR.

## Förkastade alternativ

- **Redux Toolkit:** överdimensionerat för ~200 rader state-logik.
- **Zustand:** lockande pga enkelhet, men introducerar mönster som lätt sprider sig.
- **Jotai/Recoil:** atom-modellen är elegant men löser inget problem vi har.
