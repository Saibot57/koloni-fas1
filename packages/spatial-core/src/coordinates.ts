import type { Point, Rect } from "./types.js";
import { rotatePoint } from "./rotation.js";

/**
 * Viewport state for the sandbox. Pure data; no DOM references.
 *
 * Screen coordinates are pixels with origin at the canvas top-left.
 * pixelsPerMm is uniform (no anisotropic scaling — keeps math sane).
 */
export interface Viewport {
  /** Pan offset in pixels: where world (0,0) lands on the screen. */
  panX: number;
  panY: number;
  /** Zoom: how many screen pixels represent one world millimetre. */
  pixelsPerMm: number;
}

/** World mm → screen px. */
export function worldToScreen(p: Point, vp: Viewport): Point {
  return {
    x: p.x * vp.pixelsPerMm + vp.panX,
    y: p.y * vp.pixelsPerMm + vp.panY,
  };
}

/** Screen px → world mm (returns floats; round if you need integer mm). */
export function screenToWorld(p: Point, vp: Viewport): Point {
  return {
    x: (p.x - vp.panX) / vp.pixelsPerMm,
    y: (p.y - vp.panY) / vp.pixelsPerMm,
  };
}

/**
 * Round a world coordinate to integer mm — the canonical storage form.
 */
export function snapToWorldMm(p: Point): Point {
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

/**
 * Transform a world point into the rectangle's local frame
 * (origin = rect center, axes aligned with rect's local edges).
 */
export function worldToLocal(p: Point, rect: Rect): Point {
  // Inverse rotation around center.
  return rotatePoint(p, { x: rect.cx, y: rect.cy }, -rect.rotationDeg);
}

/** Inverse of worldToLocal. */
export function localToWorld(p: Point, rect: Rect): Point {
  return rotatePoint(p, { x: rect.cx, y: rect.cy }, rect.rotationDeg);
}
