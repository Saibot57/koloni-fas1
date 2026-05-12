import type { Rect } from "@kolonitradgard/spatial-core";

export interface SandboxState {
  rectangles: Rect[];
  selectedId: string | null;
  viewport: { panX: number; panY: number; pixelsPerMm: number };
  sun: { dateIso: string };
  showShadows: boolean;
}

export type Action =
  | { type: "addRect"; rect: Rect }
  | { type: "removeSelected" }
  | { type: "select"; id: string | null }
  | { type: "moveSelected"; dx: number; dy: number } // world mm
  | { type: "rotateSelected"; deltaDeg: number }
  | { type: "resizeSelected"; dWidth: number; dHeight: number }
  | { type: "setWallHeight"; id: string; mm: number }
  | { type: "setViewport"; viewport: SandboxState["viewport"] }
  | { type: "setSun"; dateIso: string }
  | { type: "toggleShadows" };

let _id = 0;
export const nextId = (): string => `rect-${++_id}`;

export const initialState: SandboxState = {
  rectangles: [
    {
      id: nextId(),
      cx: 4000,
      cy: 4000,
      width: 2000,
      height: 1000,
      rotationDeg: 0,
      wallHeight: 0,
    },
    {
      id: nextId(),
      cx: 8000,
      cy: 4000,
      width: 1500,
      height: 1500,
      rotationDeg: 25,
      wallHeight: 0,
    },
    {
      id: nextId(),
      cx: 6000,
      cy: 1500,
      width: 4000,
      height: 200,
      rotationDeg: 0,
      wallHeight: 1800, // a tall fence/wall
    },
  ],
  selectedId: null,
  viewport: { panX: 40, panY: 40, pixelsPerMm: 0.07 },
  sun: { dateIso: new Date(2025, 5, 21, 12, 0, 0).toISOString() }, // midsummer noon local
  showShadows: true,
};

export function reducer(state: SandboxState, action: Action): SandboxState {
  switch (action.type) {
    case "addRect":
      return { ...state, rectangles: [...state.rectangles, action.rect] };
    case "removeSelected":
      if (!state.selectedId) return state;
      return {
        ...state,
        rectangles: state.rectangles.filter((r) => r.id !== state.selectedId),
        selectedId: null,
      };
    case "select":
      return { ...state, selectedId: action.id };
    case "moveSelected":
      if (!state.selectedId) return state;
      return {
        ...state,
        rectangles: state.rectangles.map((r) =>
          r.id === state.selectedId
            ? { ...r, cx: Math.round(r.cx + action.dx), cy: Math.round(r.cy + action.dy) }
            : r,
        ),
      };
    case "rotateSelected":
      if (!state.selectedId) return state;
      return {
        ...state,
        rectangles: state.rectangles.map((r) =>
          r.id === state.selectedId
            ? { ...r, rotationDeg: (r.rotationDeg + action.deltaDeg) % 360 }
            : r,
        ),
      };
    case "resizeSelected":
      if (!state.selectedId) return state;
      return {
        ...state,
        rectangles: state.rectangles.map((r) =>
          r.id === state.selectedId
            ? {
                ...r,
                width: Math.max(100, Math.round(r.width + action.dWidth)),
                height: Math.max(100, Math.round(r.height + action.dHeight)),
              }
            : r,
        ),
      };
    case "setWallHeight":
      return {
        ...state,
        rectangles: state.rectangles.map((r) =>
          r.id === action.id ? { ...r, wallHeight: Math.max(0, Math.round(action.mm)) } : r,
        ),
      };
    case "setViewport":
      return { ...state, viewport: action.viewport };
    case "setSun":
      return { ...state, sun: { dateIso: action.dateIso } };
    case "toggleShadows":
      return { ...state, showShadows: !state.showShadows };
  }
}
