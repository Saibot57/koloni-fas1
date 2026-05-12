import SunCalc from "suncalc";
import type { GeoLocation, SunPosition } from "./types.js";

/** Default location for the project: Landskrona, Sweden. */
export const DEFAULT_LOCATION: GeoLocation = {
  latitudeDeg: 55.8708,
  longitudeDeg: 12.83,
};

/**
 * Get sun position for a given moment and location.
 *
 * suncalc returns:
 *   altitude — radians above horizon
 *   azimuth  — radians, measured from south, clockwise
 */
export function sunPositionAt(date: Date, loc: GeoLocation = DEFAULT_LOCATION): SunPosition {
  const p = SunCalc.getPosition(date, loc.latitudeDeg, loc.longitudeDeg);
  return { altitudeRad: p.altitude, azimuthRad: p.azimuth };
}

/**
 * Hourly sun samples for one local-day, between startHour and endHour (inclusive of start,
 * exclusive of endHour + 1 step — i.e., samples at startHour, startHour+1, ... endHour).
 *
 * The Date arithmetic uses the host machine's timezone for the day boundary; for
 * deterministic tests, callers should pass an explicit `dateAtMidnightLocal`.
 */
export function sampleSunHourly(
  dateAtMidnightLocal: Date,
  loc: GeoLocation = DEFAULT_LOCATION,
  startHour = 6,
  endHour = 20,
): { date: Date; sun: SunPosition }[] {
  const out: { date: Date; sun: SunPosition }[] = [];
  for (let h = startHour; h <= endHour; h++) {
    const d = new Date(dateAtMidnightLocal);
    d.setHours(h, 0, 0, 0);
    out.push({ date: d, sun: sunPositionAt(d, loc) });
  }
  return out;
}
