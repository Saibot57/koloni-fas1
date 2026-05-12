import type { Point, Rect, SunPosition, Vec2 } from "./types.js";
import { rectCorners } from "./rotation.js";

/**
 * Compute the 2D shadow displacement vector (in mm) for an object of the given
 * wallHeight, given a sun position.
 *
 * Convention (see spatial_rules.md §6):
 *  - World +Y is geographic SOUTH (default for v1).
 *  - World +X is geographic EAST.
 *  - Sun azimuth (suncalc): radians measured from SOUTH, clockwise (when viewed from
 *    above with north up). So:
 *      azimuth =  0     → sun in the SOUTH  → shadow points NORTH (−Y)
 *      azimuth = +π/2   → sun in the WEST   → shadow points EAST  (+X)
 *      azimuth = −π/2   → sun in the EAST   → shadow points WEST  (−X)
 *      azimuth =  ±π    → sun in the NORTH  → shadow points SOUTH (+Y)
 *
 *  Horizontal direction toward the sun, in our world frame:
 *      toward_sun = (−sin(az), +cos(az))
 *  Shadow direction is the opposite:
 *      shadow_dir = ( sin(az), −cos(az))
 *
 * Returns null if the sun is at or below the horizon, or if wallHeight ≤ 0.
 */
export function shadowVector(wallHeight: number, sun: SunPosition): Vec2 | null {
  if (wallHeight <= 0) return null;
  if (sun.altitudeRad <= 0) return null;

  const length = wallHeight / Math.tan(sun.altitudeRad);
  return {
    x: Math.sin(sun.azimuthRad) * length,
    y: -Math.cos(sun.azimuthRad) * length,
  };
}

/**
 * Project the rectangle's footprint into a shadow polygon on the ground.
 *
 * Returns the convex hull of:
 *   - the 4 base corners of the rectangle
 *   - the 4 displaced corners (translated by shadowVector)
 *
 * Returns null if no shadow (sun below horizon, no wall height).
 */
export function projectShadow(rect: Rect, sun: SunPosition): Point[] | null {
  const v = shadowVector(rect.wallHeight, sun);
  if (!v) return null;

  const base = rectCorners(rect);
  const tips: Point[] = base.map((c) => ({ x: c.x + v.x, y: c.y + v.y }));
  return convexHull([...base, ...tips]);
}

/**
 * Andrew's monotone chain convex hull. O(n log n).
 * Returns the polygon vertices in order; collinear points are dropped.
 */
export function convexHull(points: readonly Point[]): Point[] {
  if (points.length < 3) return [...points];

  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const cross = (o: Point, a: Point, b: Point): number =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]!;
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
