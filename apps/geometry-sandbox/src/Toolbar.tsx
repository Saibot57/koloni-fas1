import type { Dispatch } from "react";
import type { Action, SandboxState } from "./state.js";
import { nextId } from "./state.js";
import type { SunPosition } from "@kolonitradgard/spatial-core";

interface Props {
  state: SandboxState;
  dispatch: Dispatch<Action>;
  bedDepth: number;
  setBedDepth: (mm: number) => void;
  sun: SunPosition;
  totalAreaM2: number;
  totalSoilL: number;
  overlapCount: number;
}

const btn = {
  background: "#2a2a2a",
  color: "#eee",
  border: "1px solid #444",
  padding: "6px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
};

const sectionStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "0 12px",
  borderRight: "1px solid #333",
};

export function Toolbar({
  state,
  dispatch,
  bedDepth,
  setBedDepth,
  sun,
  totalAreaM2,
  totalSoilL,
  overlapCount,
}: Props) {
  const selected = state.rectangles.find((r) => r.id === state.selectedId);

  const addRect = () =>
    dispatch({
      type: "addRect",
      rect: {
        id: nextId(),
        cx: 5000,
        cy: 5000,
        width: 1500,
        height: 800,
        rotationDeg: 0,
        wallHeight: 0,
      },
    });

  const dateValue = state.sun.dateIso.slice(0, 16); // "YYYY-MM-DDTHH:MM"

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#202020",
        borderBottom: "1px solid #333",
        padding: "8px 0",
        fontSize: 13,
        flexWrap: "wrap",
        rowGap: 4,
      }}
    >
      <div style={sectionStyle}>
        <strong>Koloniträdgårdsplaneraren</strong>
        <span style={{ color: "#888" }}>geometry sandbox</span>
      </div>

      <div style={sectionStyle}>
        <button style={btn} onClick={addRect}>
          + Rektangel
        </button>
        <button
          style={btn}
          onClick={() => dispatch({ type: "removeSelected" })}
          disabled={!selected}
        >
          – Ta bort
        </button>
      </div>

      {selected && (
        <div style={sectionStyle}>
          <span>Vald: {selected.id}</span>
          <button style={btn} onClick={() => dispatch({ type: "rotateSelected", deltaDeg: -15 })}>
            ↺ -15°
          </button>
          <button style={btn} onClick={() => dispatch({ type: "rotateSelected", deltaDeg: 15 })}>
            ↻ +15°
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            wallHeight (mm)
            <input
              type="number"
              value={selected.wallHeight}
              min={0}
              step={100}
              onChange={(e) =>
                dispatch({
                  type: "setWallHeight",
                  id: selected.id,
                  mm: Number(e.target.value) || 0,
                })
              }
              style={{
                width: 70,
                background: "#111",
                color: "#eee",
                border: "1px solid #444",
                padding: 3,
              }}
            />
          </label>
        </div>
      )}

      <div style={sectionStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Datum/tid
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) =>
              dispatch({ type: "setSun", dateIso: new Date(e.target.value).toISOString() })
            }
            style={{
              background: "#111",
              color: "#eee",
              border: "1px solid #444",
              padding: 3,
            }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={state.showShadows}
            onChange={() => dispatch({ type: "toggleShadows" })}
          />
          Skuggor
        </label>
      </div>

      <div style={sectionStyle}>
        <span>
          Sol: alt {((sun.altitudeRad * 180) / Math.PI).toFixed(1)}°, az{" "}
          {((sun.azimuthRad * 180) / Math.PI).toFixed(1)}°
        </span>
      </div>

      <div style={sectionStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Bäddhöjd (mm)
          <input
            type="number"
            value={bedDepth}
            min={0}
            step={50}
            onChange={(e) => setBedDepth(Number(e.target.value) || 0)}
            style={{
              width: 70,
              background: "#111",
              color: "#eee",
              border: "1px solid #444",
              padding: 3,
            }}
          />
        </label>
        <span>
          Σ {totalAreaM2.toFixed(2)} m² &middot; {totalSoilL.toFixed(0)} L jord
        </span>
      </div>

      <div style={{ ...sectionStyle, borderRight: "none" }}>
        <span style={{ color: overlapCount ? "#ff6464" : "#7c7" }}>
          {overlapCount ? `⚠ ${overlapCount} kollision(er)` : "✓ inga kollisioner"}
        </span>
      </div>
    </div>
  );
}
