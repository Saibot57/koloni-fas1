import type { Point, Rect } from "./types.js";

/** Convert degrees to radians. */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees. */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Rotate a point around an arbitrary pivot.
 *
 * Angle is degrees, clockwise in our y-down world.
 * The standard rotation matrix [[cos, -sin],[sin, cos]] applied in y-down space
 * yields visually clockwise rotation, which is what we want.
 */
export function rotatePoint(p: Point, pivot: Point, angleDeg: number): Point {
  const a = degToRad(angleDeg);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;
  return {
    x: pivot.x + dx * cos - dy * sin,
    y: pivot.y + dx * sin + dy * cos,
  };
}

/**
 * Return the four corners of a rectangle in world coordinates.
 * Order: top-left, top-right, bottom-right, bottom-left (in the rectangle's local frame),
 * then rotated around the center.
 *
 * Coordinates may be fractional (rotation introduces floats); the caller is responsible
 * for any rounding back to integer mm if needed.
 */
export function rectCorners(rect: Rect): [Point, Point, Point, Point] {
  const hw = rect.width / 2;
  const hh = rect.height / 2;
  const center: Point = { x: rect.cx, y: rect.cy };

  // Local corners (before rotation), in world frame because we treat them as offsets
  // around the center.
  const localCorners: Point[] = [
    { x: rect.cx - hw, y: rect.cy - hh }, // top-left
    { x: rect.cx + hw, y: rect.cy - hh }, // top-right
    { x: rect.cx + hw, y: rect.cy + hh }, // bottom-right
    { x: rect.cx - hw, y: rect.cy + hh }, // bottom-left
  ];

  return localCorners.map((p) => rotatePoint(p, center, rect.rotationDeg)) as [
    Point,
    Point,
    Point,
    Point,
  ];
}

/**
 * Return the two unique edge-normal axes of a rotated rectangle (for SAT).
 * For a rectangle, only 2 axes are unique (opposite edges share normals).
 */
export function rectAxes(rect: Rect): [Point, Point] {
  const a = degToRad(rect.rotationDeg);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  // Local +X axis rotated, and local +Y axis rotated.
  return [
    { x: cos, y: sin },
    { x: -sin, y: cos },
  ];
}
