/**
 * A simplified outline of Nigeria and the real places in Perey's story, for
 * the halftone map. Stylised, not survey-grade: about forty border points,
 * enough for the silhouette to read at a glance.
 *
 * Projection is plain equirectangular — 100 map units per degree, with the
 * frame's top-left at 2.6°E, 14°N. Nigeria sits close enough to the equator
 * that the stretch is invisible.
 */

export const MAP = { width: 1220, height: 980, west: 2.6, north: 14 } as const;

export const project = (lon: number, lat: number): [number, number] => [
  (lon - MAP.west) * 100,
  (MAP.north - lat) * 100,
];

/** [lon, lat], clockwise from the coast at the Benin border. */
const BORDER: [number, number][] = [
  [2.69, 6.37], [2.75, 7.1], [2.72, 7.87], [3.1, 8.65], [3.6, 9.95], [3.68, 11.1],
  [3.6, 11.7], [4.1, 12.9], [4.4, 13.6], [5.5, 13.85], [6.5, 13.4], [7.8, 13.3],
  [9.0, 12.85], [10.0, 13.2], [11.0, 13.35], [12.3, 13.1], [13.3, 13.55], [14.1, 13.1],
  [14.2, 12.5], [14.65, 12.2], [14.5, 11.5], [13.8, 10.9], [13.3, 10.2], [13.2, 9.7],
  [12.8, 8.8], [12.2, 8.4], [11.8, 7.3], [11.1, 6.6], [10.6, 7.0], [10.0, 6.9],
  [9.5, 6.4], [8.9, 5.0], [8.5, 4.55], [7.1, 4.4], [6.1, 4.27], [5.4, 5.1],
  [4.9, 6.0], [4.4, 6.3], [3.4, 6.4],
];

export const OUTLINE = BORDER.map(([lon, lat]) => project(lon, lat));

/** Ray-casting point-in-polygon, in map units. */
export const insideNigeria = (x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

export interface Place {
  id: string;
  name: string;
  /** What happened there — from the resume. */
  note: string;
  when: string;
  x: number;
  y: number;
  /** Which side of the marker the label sits. */
  side: "left" | "right";
}

const at = (lon: number, lat: number) => {
  const [x, y] = project(lon, lat);
  return { x, y };
};

export const PLACES: Place[] = [
  {
    id: "oyo",
    name: "Oyo",
    note: "Lord's Secondary School · FCE (Special) internship",
    when: "2008 – 2025",
    ...at(3.93, 7.85),
    side: "right",
  },
  {
    id: "ibadan",
    name: "Ibadan",
    note: "NUESA quiz platform, UI-FCES chapter",
    when: "Freelance",
    ...at(3.9, 7.38),
    side: "right",
  },
  {
    id: "biu",
    name: "Biu",
    note: "B.Sc. Computer Science, NAUB",
    when: "2025 – now",
    ...at(12.19, 10.61),
    side: "left",
  },
];

/** The story's route: Oyo, a short hop to Ibadan, then the long run to Biu. */
export const ROUTE = (() => {
  const [oyo, ibadan, biu] = PLACES;
  return `M${oyo.x} ${oyo.y} Q ${oyo.x - 40} ${(oyo.y + ibadan.y) / 2} ${ibadan.x} ${ibadan.y} C ${ibadan.x + 260} ${ibadan.y + 40}, ${biu.x - 330} ${biu.y + 120}, ${biu.x} ${biu.y}`;
})();
