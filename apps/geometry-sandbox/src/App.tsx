import { useReducer, useState } from "react";
import { Canvas } from "./Canvas.js";
import { Toolbar } from "./Toolbar.js";
import { initialState, reducer } from "./state.js";
import {
  rectIntersects,
  rectOverlap,
  bedSoilVolumeLitres,
  rectAreaM2,
  sunPositionAt,
  DEFAULT_LOCATION,
} from "@kolonitradgard/spatial-core";

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [bedDepth, setBedDepth] = useState(300); // mm

  // Derived: pairwise overlaps
  const overlappingIds = new Set<string>();
  for (let i = 0; i < state.rectangles.length; i++) {
    for (let j = i + 1; j < state.rectangles.length; j++) {
      const a = state.rectangles[i]!;
      const b = state.rectangles[j]!;
      if (rectOverlap(a, b)) {
        overlappingIds.add(a.id);
        overlappingIds.add(b.id);
      }
    }
  }

  // Derived: sun for "now" at the chosen date
  const sun = sunPositionAt(new Date(state.sun.dateIso), DEFAULT_LOCATION);

  const totalAreaM2 = state.rectangles.reduce((s, r) => s + rectAreaM2(r), 0);
  const totalSoilL = state.rectangles.reduce(
    (s, r) => s + bedSoilVolumeLitres(r, bedDepth),
    0,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        state={state}
        dispatch={dispatch}
        bedDepth={bedDepth}
        setBedDepth={setBedDepth}
        sun={sun}
        totalAreaM2={totalAreaM2}
        totalSoilL={totalSoilL}
        overlapCount={overlappingIds.size / 2}
      />
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          state={state}
          dispatch={dispatch}
          sun={sun}
          overlappingIds={overlappingIds}
        />
      </div>
    </div>
  );
}
