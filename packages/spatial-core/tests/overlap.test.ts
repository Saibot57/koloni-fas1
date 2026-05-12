import { describe, it, expect } from "vitest";
import { rectOverlap, rectEdgeTouch, rectIntersects } from "../src/overlap.js";
import type { Rect } from "../src/types.js";

function r(
  id: string,
  cx: number,
  cy: number,
  w: number,
  h: number,
  rot = 0,
): Rect {
  return { id, cx, cy, width: w, height: h, rotationDeg: rot, wallHeight: 0 };
}

describe("rectOverlap (axis-aligned)", () => {
  it("identical rectangles overlap", () => {
    expect(rectOverlap(r("a", 0, 0, 100, 100), r("b", 0, 0, 100, 100))).toBe(true);
  });

  it("clearly separated rectangles do not overlap", () => {
    expect(rectOverlap(r("a", 0, 0, 100, 100), r("b", 1000, 1000, 100, 100))).toBe(
      false,
    );
  });

  it("partially overlapping rectangles overlap", () => {
    expect(rectOverlap(r("a", 0, 0, 100, 100), r("b", 50, 50, 100, 100))).toBe(true);
  });

  it("edge-touch is NOT overlap", () => {
    // Right edge of A at x=50, left edge of B at x=50.
    expect(rectOverlap(r("a", 0, 0, 100, 100), r("b", 100, 0, 100, 100))).toBe(false);
  });

  it("corner-touch is NOT overlap", () => {
    expect(rectOverlap(r("a", 0, 0, 100, 100), r("b", 100, 100, 100, 100))).toBe(false);
  });
});

describe("rectOverlap (rotated)", () => {
  it("rotated rectangles that visually overlap return true", () => {
    // Square A at origin, square B at origin rotated 45° → must overlap.
    expect(rectOverlap(r("a", 0, 0, 200, 200), r("b", 0, 0, 200, 200, 45))).toBe(true);
  });

  it("rotated rectangle just touching another is not overlap", () => {
    // A 200x200 at origin. B 200x200 rotated 45° has half-diagonal = 100*sqrt(2) ≈ 141.42
    // Place B so its left vertex touches A's right edge at x=100.
    const A = r("a", 0, 0, 200, 200, 0);
    const half = 100 * Math.SQRT2;
    const B = r("b", 100 + half, 0, 200, 200, 45);
    expect(rectOverlap(A, B)).toBe(false);
  });

  it("rotated rectangle clearly separated does not overlap", () => {
    expect(rectOverlap(r("a", 0, 0, 200, 200, 30), r("b", 1000, 0, 200, 200, 60))).toBe(
      false,
    );
  });
});

describe("rectEdgeTouch", () => {
  it("returns true for shared-edge touch", () => {
    expect(rectEdgeTouch(r("a", 0, 0, 100, 100), r("b", 100, 0, 100, 100))).toBe(true);
  });

  it("returns true for corner touch", () => {
    expect(rectEdgeTouch(r("a", 0, 0, 100, 100), r("b", 100, 100, 100, 100))).toBe(true);
  });

  it("returns false when overlapping", () => {
    expect(rectEdgeTouch(r("a", 0, 0, 100, 100), r("b", 50, 0, 100, 100))).toBe(false);
  });

  it("returns false when separated", () => {
    expect(rectEdgeTouch(r("a", 0, 0, 100, 100), r("b", 1000, 0, 100, 100))).toBe(false);
  });
});

describe("rectIntersects", () => {
  it("true for both overlap and touch", () => {
    expect(rectIntersects(r("a", 0, 0, 100, 100), r("b", 50, 0, 100, 100))).toBe(true);
    expect(rectIntersects(r("a", 0, 0, 100, 100), r("b", 100, 0, 100, 100))).toBe(true);
  });

  it("false when separated", () => {
    expect(rectIntersects(r("a", 0, 0, 100, 100), r("b", 1000, 0, 100, 100))).toBe(
      false,
    );
  });
});
