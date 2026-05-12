import { describe, it, expect } from "vitest";
import {
  worldToScreen,
  screenToWorld,
  snapToWorldMm,
  worldToLocal,
  localToWorld,
  type Viewport,
} from "../src/coordinates.js";
import type { Rect } from "../src/types.js";

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;

describe("world ↔ screen", () => {
  const vp: Viewport = { panX: 50, panY: 100, pixelsPerMm: 0.1 };

  it("world (0,0) maps to (panX, panY)", () => {
    expect(worldToScreen({ x: 0, y: 0 }, vp)).toEqual({ x: 50, y: 100 });
  });

  it("round-trip world → screen → world is exact", () => {
    const w = { x: 1234, y: -567 };
    const s = worldToScreen(w, vp);
    const back = screenToWorld(s, vp);
    expect(close(back.x, w.x)).toBe(true);
    expect(close(back.y, w.y)).toBe(true);
  });

  it("zoom scales correctly", () => {
    const vp2: Viewport = { panX: 0, panY: 0, pixelsPerMm: 2 };
    expect(worldToScreen({ x: 100, y: 50 }, vp2)).toEqual({ x: 200, y: 100 });
  });
});

describe("snapToWorldMm", () => {
  it("rounds to nearest integer", () => {
    expect(snapToWorldMm({ x: 10.4, y: -2.7 })).toEqual({ x: 10, y: -3 });
    // Math.round(-0.5) === -0 in JS; we accept either signed-zero.
    const r = snapToWorldMm({ x: 0.5, y: -0.5 });
    expect(r.x).toBe(1);
    expect(r.y === 0 || Object.is(r.y, -0)).toBe(true);
  });
});

describe("world ↔ local frame", () => {
  const rect: Rect = {
    id: "r",
    cx: 1000,
    cy: 1000,
    width: 200,
    height: 100,
    rotationDeg: 30,
    wallHeight: 0,
  };

  it("center maps to local origin (in absolute coords, since worldToLocal is just inverse rotation around center)", () => {
    const local = worldToLocal({ x: rect.cx, y: rect.cy }, rect);
    expect(close(local.x, rect.cx)).toBe(true);
    expect(close(local.y, rect.cy)).toBe(true);
  });

  it("round-trip local → world → local is exact", () => {
    const w = { x: 1100, y: 950 };
    const l = worldToLocal(w, rect);
    const back = localToWorld(l, rect);
    expect(close(back.x, w.x, 1e-9)).toBe(true);
    expect(close(back.y, w.y, 1e-9)).toBe(true);
  });
});
