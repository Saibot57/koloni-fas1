import type { Point, Rect } from "./types.js";
import { rectAxes, rectCorners } from "./rotation.js";

/** Tolerance for edge-touch (in mm). Half a micrometre — generous against FP noise. */
const EDGE_TOUCH_EPSILON = 1e-6;

interface Projection {
  min: number;
  max: number;
}

function projectOntoAxis(corners: readonly Point[], axis: Point): Projection {
  let min = corners[0]!.x * axis.x + corners[0]!.y * axis.y;
  let max = min;
  for (let i = 1; i < corners.length; i++) {
    const v = corners[i]!.x * axis.x + corners[i]!.y * axis.y;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

/**
 * Strict overlap: returns true only if the two rectangles share interior area.
 * Edge-touch and corner-touch return false.
 *
 * Implemented via Separating Axis Theorem on the 4 unique normals.
 */
export function rectOverlap(a: Rect, b: Rect): boolean {
  const axes: Point[] = [...rectAxes(a), ...rectAxes(b)];
  const ca = rectCorners(a);
  const cb = rectCorners(b);

  for (const axis of axes) {
    const pa = projectOntoAxis(ca, axis);
    const pb = projectOntoAxis(cb, axis);
    // If projections are separated OR exactly touch (within epsilon), no overlap.
    if (pa.max <= pb.min + EDGE_TOUCH_EPSILON) return false;
    if (pb.max <= pa.min + EDGE_TOUCH_EPSILON) return false;
  }
  return true;
}

/**
 * Edge-touch detection: true if rectangles touch (share a point or a segment)
 * but do not overlap.
 */
export function rectEdgeTouch(a: Rect, b: Rect): boolean {
  if (rectOverlap(a, b)) return false;

  const axes: Point[] = [...rectAxes(a), ...rectAxes(b)];
  const ca = rectCorners(a);
  const cb = rectCorners(b);

  // For touch: on every axis, projections overlap or touch (not separated),
  // AND on at least one axis, they exactly touch (max == min within epsilon).
  let exactTouchSomewhere = false;
  for (const axis of axes) {
    const pa = projectOntoAxis(ca, axis);
    const pb = projectOntoAxis(cb, axis);
    if (pa.max < pb.min - EDGE_TOUCH_EPSILON) return false;
    if (pb.max < pa.min - EDGE_TOUCH_EPSILON) return false;
    const touchA = Math.abs(pa.max - pb.min) <= EDGE_TOUCH_EPSILON;
    const touchB = Math.abs(pb.max - pa.min) <= EDGE_TOUCH_EPSILON;
    if (touchA || touchB) exactTouchSomewhere = true;
  }
  return exactTouchSomewhere;
}

/** Convenience: overlap OR edge-touch. */
export function rectIntersects(a: Rect, b: Rect): boolean {
  return rectOverlap(a, b) || rectEdgeTouch(a, b);
}
