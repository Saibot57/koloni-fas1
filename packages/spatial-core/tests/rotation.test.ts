import { describe, it, expect } from "vitest";
import { degToRad, radToDeg, rotatePoint, rectCorners } from "../src/rotation.js";
import type { Rect } from "../src/types.js";

const close = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) <= eps;

describe("degToRad / radToDeg", () => {
  it("round-trips", () => {
    for (const d of [0, 1, 45, 90, 180, 359.999]) {
      expect(close(radToDeg(degToRad(d)), d)).toBe(true);
    }
  });
});

describe("rotatePoint", () => {
  it("0° is identity", () => {
    const p = { x: 100, y: 200 };
    const r = rotatePoint(p, { x: 0, y: 0 }, 0);
    expect(close(r.x, 100)).toBe(true);
    expect(close(r.y, 200)).toBe(true);
  });

  it("rotates clockwise in y-down world (90° → +X becomes +Y)", () => {
    // Point at world +X (1000, 0) rotated 90° clockwise around origin
    // should land at world +Y (0, 1000) — because clockwise in y-down looks
    // like clockwise on screen.
    const p = { x: 1000, y: 0 };
    const r = rotatePoint(p, { x: 0, y: 0 }, 90);
    expect(close(r.x, 0)).toBe(true);
    expect(close(r.y, 1000)).toBe(true);
  });

  it("180° flips through pivot", () => {
    const p = { x: 500, y: -300 };
    const pivot = { x: 100, y: 100 };
    const r = rotatePoint(p, pivot, 180);
    expect(close(r.x, -300)).toBe(true);
    expect(close(r.y, 500)).toBe(true);
  });

  it("360° returns to origin", () => {
    const p = { x: 17, y: 23 };
    const r = rotatePoint(p, { x: 0, y: 0 }, 360);
    expect(close(r.x, 17, 1e-9)).toBe(true);
    expect(close(r.y, 23, 1e-9)).toBe(true);
  });

  it("rotation around non-origin pivot", () => {
    const p = { x: 200, y: 100 };
    const pivot = { x: 100, y: 100 };
    // 90° clockwise: relative (100,0) → (0,100), absolute (100,200)
    const r = rotatePoint(p, pivot, 90);
    expect(close(r.x, 100)).toBe(true);
    expect(close(r.y, 200)).toBe(true);
  });
});

describe("rectCorners", () => {
  it("axis-aligned rectangle has expected corners", () => {
    const rect: Rect = {
      id: "r",
      cx: 1000,
      cy: 1000,
      width: 600,
      height: 400,
      rotationDeg: 0,
      wallHeight: 0,
    };
    const c = rectCorners(rect);
    expect(c[0]).toEqual({ x: 700, y: 800 }); // top-left
    expect(c[1]).toEqual({ x: 1300, y: 800 }); // top-right
    expect(c[2]).toEqual({ x: 1300, y: 1200 }); // bottom-right
    expect(c[3]).toEqual({ x: 700, y: 1200 }); // bottom-left
  });

  it("90° rotation swaps width and height in AABB sense", () => {
    const rect: Rect = {
      id: "r",
      cx: 0,
      cy: 0,
      width: 600,
      height: 400,
      rotationDeg: 90,
      wallHeight: 0,
    };
    const c = rectCorners(rect);
    // After 90° CW, top-left (-300, -200) becomes (200, -300)
    expect(close(c[0].x, 200)).toBe(true);
    expect(close(c[0].y, -300)).toBe(true);
  });
});
