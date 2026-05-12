import { describe, it, expect } from "vitest";
import { rectAreaMm2, rectAreaM2, bedSoilVolumeLitres } from "../src/measure.js";
import type { Rect } from "../src/types.js";

const r: Rect = {
  id: "bed",
  cx: 0,
  cy: 0,
  width: 2000, // 2 m
  height: 1000, // 1 m
  rotationDeg: 17, // rotation must not affect area
  wallHeight: 0,
};

describe("measure", () => {
  it("area mm² is width * height", () => {
    expect(rectAreaMm2(r)).toBe(2_000_000);
  });
  it("area m² is mm² / 1e6", () => {
    expect(rectAreaM2(r)).toBe(2);
  });
  it("soil volume: 2m × 1m × 300mm bed = 600 litres", () => {
    expect(bedSoilVolumeLitres(r, 300)).toBe(600);
  });
  it("zero or negative depth → 0", () => {
    expect(bedSoilVolumeLitres(r, 0)).toBe(0);
    expect(bedSoilVolumeLitres(r, -50)).toBe(0);
  });
});
