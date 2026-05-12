/**
 * Solar prototype.
 *
 * Tar en liten fast scen (en bädd och en vägg) och skriver ut, för varje timme
 * mellan 06:00 och 20:00 vid midsommar i Landskrona:
 *   - solposition
 *   - om bädden ligger i skuggan av väggen
 *
 * Rent verifieringssyfte i FAS 1. Ingen optimering, ingen plottning.
 */

import {
  sampleSunHourly,
  projectShadow,
  rectCorners,
  DEFAULT_LOCATION,
  type Rect,
  type Point,
} from "@kolonitradgard/spatial-core";

const WALL: Rect = {
  id: "south-wall",
  cx: 5000,
  cy: 3000,
  width: 4000,
  height: 200,
  rotationDeg: 0,
  wallHeight: 1800,
};

const BED: Rect = {
  id: "bed-A",
  cx: 5000,
  cy: 5000, // 2 m south of wall
  width: 1500,
  height: 1000,
  rotationDeg: 0,
  wallHeight: 0,
};

/** Point-in-polygon (ray casting). */
function pointInPolygon(p: Point, poly: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function bedShadedFraction(bed: Rect, shadow: readonly Point[]): number {
  // Sample the bed's 4 corners + center; coarse but fine for a prototype.
  const samples = [...rectCorners(bed), { x: bed.cx, y: bed.cy }];
  let n = 0;
  for (const s of samples) if (pointInPolygon(s, shadow)) n++;
  return n / samples.length;
}

function main(): void {
  const midsummer = new Date(2025, 5, 21, 0, 0, 0);
  const samples = sampleSunHourly(midsummer, DEFAULT_LOCATION, 6, 20);

  console.log(
    `Solar prototype — Landskrona midsummer (${midsummer.toDateString()})\n`,
  );
  console.log(
    "time   altitude°  azimuth°   shadow length (mm)   bed-A shaded?",
  );
  console.log("------------------------------------------------------------------");

  let sunHours = 0;
  for (const { date, sun } of samples) {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    const altDeg = ((sun.altitudeRad * 180) / Math.PI).toFixed(1).padStart(7);
    const azDeg = ((sun.azimuthRad * 180) / Math.PI).toFixed(1).padStart(7);

    const shadow = projectShadow(WALL, sun);
    const len = shadow
      ? `${(WALL.wallHeight / Math.tan(sun.altitudeRad)).toFixed(0).padStart(8)}`
      : "       —";

    let shadedFrac = 0;
    if (shadow) shadedFrac = bedShadedFraction(BED, shadow);

    const lit = shadedFrac < 0.5;
    if (lit && sun.altitudeRad > 0) sunHours++;

    console.log(
      `${h}:${m}    ${altDeg}    ${azDeg}            ${len}    ${
        shadow ? `${(shadedFrac * 100).toFixed(0)}%` : "—"
      } ${lit ? "(sun)" : "(shade)"}`,
    );
  }

  console.log(
    `\nUppskattat antal soltimmar för bed-A vid midsommar: ~${sunHours} h`,
  );
  console.log(
    "(Sampling 1/h → upplösning ±30 min, se docs/product_scope.md)",
  );
}

main();
