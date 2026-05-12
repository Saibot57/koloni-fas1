/**
 * Spatial core types.
 *
 * All world-coordinates are millimeters (integers, see ADR/spatial_rules.md).
 * Angles are degrees, clockwise, around the rectangle's center.
 */

/** A 2D point in world space. mm. */
export interface Point {
  x: number;
  y: number;
}

/** A 2D vector in world space. mm. */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * An axis-aligned rectangle. Used internally for AABB tests.
 * mm.
 */
export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * The primary spatial object in v1: an oriented (rotated) rectangle.
 *
 * - Position is the *center* (cx, cy), not a corner.
 * - rotationDeg is clockwise in world coordinates (y-down).
 * - wallHeight is used for shadow projection. 0 means no shadow.
 */
export interface Rect {
  id: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
  rotationDeg: number;
  /** mm. 0 = no shadow caster. */
  wallHeight: number;
}

/** A geographic location. */
export interface GeoLocation {
  latitudeDeg: number;
  longitudeDeg: number;
}

/** Sun position relative to the observer. */
export interface SunPosition {
  /** Radians above the horizon. <= 0 means the sun is below the horizon. */
  altitudeRad: number;
  /**
   * Radians, measured from south, clockwise (suncalc convention):
   * 0 = south, +π/2 = west, ±π = north, -π/2 = east.
   */
  azimuthRad: number;
}
