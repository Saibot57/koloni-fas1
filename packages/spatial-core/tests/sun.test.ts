import { describe, it, expect } from "vitest";
import { sunPositionAt, sampleSunHourly, DEFAULT_LOCATION } from "../src/sun.js";

describe("sun (Landskrona, default location)", () => {
  it("midsummer noon: sun is high above horizon", () => {
    // 2024-06-21 12:00 UTC ≈ 14:00 local. Should be high in the sky.
    const d = new Date(Date.UTC(2024, 5, 21, 12, 0, 0));
    const s = sunPositionAt(d, DEFAULT_LOCATION);
    // Altitude in radians; 50° = 0.873 rad. Should be > 0.8 around solar noon.
    expect(s.altitudeRad).toBeGreaterThan(0.8);
  });

  it("midwinter midnight: sun is below horizon", () => {
    const d = new Date(Date.UTC(2024, 11, 21, 0, 0, 0));
    const s = sunPositionAt(d, DEFAULT_LOCATION);
    expect(s.altitudeRad).toBeLessThan(0);
  });

  it("hourly sampling produces 15 entries 06–20 inclusive", () => {
    const midnight = new Date(2024, 5, 21, 0, 0, 0); // local midnight
    const samples = sampleSunHourly(midnight, DEFAULT_LOCATION, 6, 20);
    expect(samples.length).toBe(15);
    const first = samples[0];
    const last = samples[samples.length - 1];
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    expect(first!.date.getHours()).toBe(6);
    expect(last!.date.getHours()).toBe(20);
  });
});
