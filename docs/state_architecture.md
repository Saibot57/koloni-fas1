# State Architecture

## Princip

> Inget state management library i FAS 1. Ingen Redux, ingen Zustand, ingen Jotai.

State hanteras med **React-inbyggda primitiver** (`useState`, `useReducer`, context där
absolut nödvändigt). Detta är ett medvetet val för att hålla FAS 1 fokuserat på
spatial matematik, inte på arkitekturpussel.

Beslut låst i **ADR-004**.

## Lager

```
┌─────────────────────────────────────────┐
│  apps/geometry-sandbox  (React + Canvas)│
│  - useState för rektangellista          │
│  - useReducer för redo/undo (om behövs) │
│  - Canvas är ren render av state        │
└─────────────────────────────────────────┘
                 │ importerar
                 ▼
┌─────────────────────────────────────────┐
│  packages/spatial-core  (rena funktioner)│
│  - inget state                          │
│  - inga sidoeffekter                    │
│  - inga deps utöver suncalc             │
└─────────────────────────────────────────┘
```

## Datafloden i sandboxen

```
   user input
       │
       ▼
   reducer / setState  ─────►  immutable state-snapshot
                                       │
                                       ▼
                              spatial-core funktioner
                              (overlap?, shadows?, sun-hours?)
                                       │
                                       ▼
                              derived data (memo)
                                       │
                                       ▼
                              Canvas render
```

## State-shape (sandbox)

```ts
type SandboxState = {
  rectangles: Rect[];           // user-placed objects
  selectedId: string | null;
  viewport: { panX: number; panY: number; zoom: number };
  sun: { date: string /* ISO */; lat: number; lon: number };
  showShadows: boolean;
};
```

## När får vi införa ett library?

Ej i FAS 1. Vid FAS 2, om och endast om:

- Vi behöver delat state mellan ≥3 ovaliserade komponentträd, *och*
- React Context har visat sig orsaka mätbara render-problem.

Innan dess: prop drilling och `useReducer` räcker.

## Sidoeffekter

- Persistence: ingen i FAS 1.
- Nätverk: ingen i FAS 1.
- Solberäkningar: rena (suncalc är pure given Date+lat+lon).
