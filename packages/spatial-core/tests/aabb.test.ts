import { describe, it, expect } from "vitest";
import { rectAABB, aabbOverlap, aabbContainsPoint } from "../src/aabb.js";
import type { Rect } from "../src/types.js";

describe("rectAABB", () => {
  it("axis-aligned rectangle has tight AABB", () => {
    const rect: Rect = {
      id: "r",
      cx: 100,
      cy: 100,
      width: 200,
      height: 100,
      rotationDeg: 0,
      wallHeight: 0,
    };
    const box = rectAABB(rect);
    expect(box).toEqual({ minX: 0, minY: 50, maxX: 200, maxY: 150 });
  });

  it("45° rotated square has diagonal AABB", () => {
    const rect: Rect = {
      id: "r",
      cx: 0,
      cy: 0,
      width: 100,
      height: 100,
      rotationDeg: 45,
      wallHeight: 0,
    };
    const box = rectAABB(rect);
    const half = 50 * Math.SQRT2;
    expect(box.minX).toBeCloseTo(-half, 9);
    expect(box.maxX).toBeCloseTo(half, 9);
  });
});

describe("aabbOverlap", () => {
  it("touching edges do NOT overlap", () => {
    expect(
      aabbOverlap({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, { minX: 100, minY: 0, maxX: 200, maxY: 100 }),
    ).toBe(false);
  });

  it("interior overlap returns true", () => {
    expect(
      aabbOverlap({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, { minX: 50, minY: 50, maxX: 150, maxY: 150 }),
    ).toBe(true);
  });
});

describe("aabbContainsPoint", () => {
  it("contains interior points", () => {
    expect(aabbContainsPoint({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { x: 5, y: 5 })).toBe(true);
  });
  it("contains edge points (inclusive)", () => {
    expect(aabbContainsPoint({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { x: 10, y: 5 })).toBe(true);
  });
  it("excludes outside points", () => {
    expect(aabbContainsPoint({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { x: 11, y: 5 })).toBe(false);
  });
});
