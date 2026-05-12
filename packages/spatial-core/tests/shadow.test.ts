import { describe, it, expect } from "vitest";
import { shadowVector, projectShadow, convexHull } from "../src/shadow.js";
import type { Rect, SunPosition } from "../src/types.js";

const close = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) <= eps;

describe("shadowVector", () => {
  it("returns null when wallHeight is 0", () => {
    const sun: SunPosition = { altitudeRad: Math.PI / 4, azimuthRad: 0 };
    expect(shadowVector(0, sun)).toBeNull();
  });

  it("returns null when sun is below horizon", () => {
    const sun: SunPosition = { altitudeRad: -0.1, azimuthRad: 0 };
    expect(shadowVector(2000, sun)).toBeNull();
  });

  it("at 45° altitude, shadow length equals wall height", () => {
    // Sun due south (azimuth 0) → shadow points NORTH (-Y in our world).
    const sun: SunPosition = { altitudeRad: Math.PI / 4, azimuthRad: 0 };
    const v = shadowVector(2000, sun)!;
    expect(close(v.x, 0)).toBe(true);
    expect(close(v.y, -2000, 1e-9)).toBe(true);
  });

  it("sun in west (azimuth +π/2) → shadow points east (+X)", () => {
    const sun: SunPosition = { altitudeRad: Math.PI / 4, azimuthRad: Math.PI / 2 };
    const v = shadowVector(1000, sun)!;
    expect(close(v.x, 1000, 1e-9)).toBe(true);
    expect(close(v.y, 0, 1e-9)).toBe(true);
  });

  it("sun in east (azimuth -π/2) → shadow points west (-X)", () => {
    const sun: SunPosition = { altitudeRad: Math.PI / 4, azimuthRad: -Math.PI / 2 };
    const v = shadowVector(1000, sun)!;
    expect(close(v.x, -1000, 1e-9)).toBe(true);
    expect(close(v.y, 0, 1e-9)).toBe(true);
  });

  it("low sun produces long shadow", () => {
    const sun: SunPosition = { altitudeRad: 0.1, azimuthRad: 0 }; // ~5.7° above horizon
    const v = shadowVector(1000, sun)!;
    // tan(0.1) ≈ 0.10033, so length ≈ 9966 mm
    expect(v.y).toBeLessThan(-9000);
    expect(v.y).toBeGreaterThan(-11000);
  });
});

describe("projectShadow", () => {
  it("returns null when no shadow", () => {
    const rect: Rect = {
      id: "r",
      cx: 0,
      cy: 0,
      width: 100,
      height: 100,
      rotationDeg: 0,
      wallHeight: 0,
    };
    const sun: SunPosition = { altitudeRad: Math.PI / 4, azimuthRad: 0 };
    expect(projectShadow(rect, sun)).toBeNull();
  });

  it("returns a polygon containing the original rectangle", () => {
    const rect: Rect = {
      id: "r",
      cx: 0,
      cy: 0,
      width: 100,
      height: 100,
      rotationDeg: 0,
      wallHeight: 1000,
    };
    const sun: SunPosition = { altitudeRad: Math.PI / 4, azimuthRad: 0 }; // shadow points -Y
    const poly = projectShadow(rect, sun);
    expect(poly).not.toBeNull();
    expect(poly!.length).toBeGreaterThanOrEqual(4);
    // The polygon must extend at least 1000mm to the north of the rectangle (y < -50 - 1000 area)
    const minY = Math.min(...poly!.map((p) => p.y));
    expect(minY).toBeCloseTo(-1050, 6);
  });
});

describe("convexHull", () => {
  it("returns the hull of a square's points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 }, // interior point — should be discarded
    ];
    const hull = convexHull(points);
    expect(hull.length).toBe(4);
    expect(hull).not.toContainEqual({ x: 5, y: 5 });
  });

  it("handles collinear points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const hull = convexHull(points);
    // Collinear midpoint on bottom edge should be removed.
    expect(hull.length).toBe(4);
  });
});
