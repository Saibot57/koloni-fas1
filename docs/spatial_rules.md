# Spatial Rules

Detta dokument är **normativt**. All spatial matematik i `packages/spatial-core` och alla
visualiseringar i `apps/geometry-sandbox` följer dessa regler. Om koden avviker — koden
har fel, inte dokumentet.

## 1. Enheter

- **All world-koordinat lagras som heltal i millimeter (`mm`).**
- Inga floats i lagrad data. Floats används endast tillfälligt i intern matematik.
- Vinklar lagras som **grader** (heltal eller flyt — beslut: flyt tillåtet, då rotation sällan är hel grad).
- Tid lagras som ISO 8601 UTC.

Rationale: heltal eliminerar avrundningsdrift mellan sessioner och gör overlap-tester
exakta vid edge-touch.

## 2. Koordinatsystem

```
   +X →
+Y
↓        (origin = top-left)
```

- Origin är **top-left** av världen.
- X ökar åt **höger**.
- Y ökar **nedåt**.

Detta matchar canvas/SVG-konventionen och undviker en transformation i renderingslagret.

## 3. Rotation

- Vinkel mäts i **grader**.
- Positiv rotation är **medurs (clockwise)** i världen.
  - Notera: i ett matematiskt y-uppåt-system skulle medurs vara negativ. I vårt
    y-nedåt-system är medurs *positiv* via standard matrismatematik
    `[cos θ, -sin θ; sin θ, cos θ]`. Se `rotation.test.ts` för verifiering.
- Rotation sker kring objektets **centerpunkt**, aldrig kring hörnet.
- 0° = orörd; rektangelns lokala +X-axel pekar mot världens +X.

## 4. Objekttyper (v1)

Endast **roterade rektanglar (OBB — oriented bounding boxes)**.

```ts
type Rect = {
  id: string;
  cx: number;        // centrum X i mm (heltal)
  cy: number;        // centrum Y i mm (heltal)
  width: number;     // mm (heltal, > 0)
  height: number;    // mm (heltal, > 0)
  rotationDeg: number; // grader, medurs
  wallHeight: number;  // mm, för skuggprojektion (0 = ingen skugga)
};
```

Inga polygoner, cirklar eller fri-form. Beslut låst i ADR-002.

## 5. Kollision

- **Overlap är förbjudet.**
- **Edge-touch är tillåtet.** Två rektanglar som delar exakt en kant eller ett hörn
  räknas inte som överlappande.
- Kollision avgörs med **Separating Axis Theorem (SAT)** över de fyra unika axlarna
  (två per rektangel).
- Tolerans: 0 mm (heltalsaritmetik gör tolerans onödig). Floating-point-mellanresultat
  jämförs med epsilon = `1e-6` *mm²* för areal-baserade tester.

## 6. Skuggor

- Skuggor projiceras från rektangelns 4 hörn.
- Höjd kommer från `wallHeight` (mm).
- `mature_plant_height` **ignoreras i v1** (ADR-003).
- Skuggans längd ges av:

  ```
  shadowLength_mm = wallHeight_mm / tan(solarAltitude_rad)
  ```

  Om `solarAltitude <= 0` (sol under horisonten) → ingen skugga.

- Skuggans riktning är **bort från solen** i världsplanet:
  - Solens azimut konverteras från geografiskt (N=0°, medurs) till världsplanet.
  - Sandboxen antar default att världens +Y-axel pekar mot **geografisk syd**.
    Detta kan parametriseras senare; i v1 är det fast.
- Skuggan är ett **konvext polygonprojektion** av rektangeln längs skuggvektorn,
  union:ad med originalrektangeln. I v1 returnerar vi de 4–8 punkter som utgör
  konvexa hyljet.

## 7. Solmodell

- Bibliotek: **`suncalc`** (JS-port av NOAA-formler, ungefärlig).
- Sampling: **var 60:e minut**, från **06:00 till 20:00 lokal tid**.
- Ingen reflekterad eller diffus belysning.
- Default-plats: **Landskrona, Sverige** (lat ≈ 55.8708, lon ≈ 12.8300).

## 8. Coordinate transforms

Tre rum:

| Rum | Enhet | Beskrivning |
|---|---|---|
| **World** | mm (heltal) | Sann fysisk plats |
| **Local** | mm | Lokalt för en rektangel (centrum = origin, axlar längs rektangelns sidor) |
| **Screen** | px (flyt) | Pixlar i sandboxens canvas, beror av zoom + pan |

Transforms är rena funktioner i `coordinates.ts`. Screen ↔ World har en epsilon på
0.5 mm vid round-trip pga pixel-kvantisering — testat.

## 9. Vad som **inte** är spatial-cores ansvar

- Persistens / disk
- Nätverk / API
- Rendering / DOM
- Användarval av enheter (alltid mm)
- Tidszoner (lämnas till anropare; suncalc tar JS Date i UTC)
