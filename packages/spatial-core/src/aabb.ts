import type { AABB, Point, Rect } from "./types.js";
import { rectCorners } from "./rotation.js";

/** Build the world-aligned bounding box of a rotated rectangle. */
export function rectAABB(rect: Rect): AABB {
  const corners = rectCorners(rect);
  let minX = corners[0].x;
  let minY = corners[0].y;
  let maxX = corners[0].x;
  let maxY = corners[0].y;
  for (let i = 1; i < corners.length; i++) {
    const c = corners[i]!;
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.x > maxX) maxX = c.x;
    if (c.y > maxY) maxY = c.y;
  }
  return { minX, minY, maxX, maxY };
}

/** AABB-vs-AABB overlap (half-open: edge-touch returns false). */
export function aabbOverlap(a: AABB, b: AABB): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}

/** Whether a point lies inside (or on the edge of) an AABB. */
export function aabbContainsPoint(box: AABB, p: Point): boolean {
  return p.x >= box.minX && p.x <= box.maxX && p.y >= box.minY && p.y <= box.maxY;
}
