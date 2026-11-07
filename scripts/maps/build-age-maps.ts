/**
 * Builds the parchment age maps (GAME_DESIGN 7.2) from Natural Earth data (public domain,
 * via the world-atlas package). For each playable age it projects the age's region,
 * clips and simplifies the land, adds a few rivers, and writes:
 * - src/content/maps/age-<id>.svg: land, coast and rivers;
 * - src/content/maps/age-<id>.json: the map size and the projected battle, city and river
 *   label positions, so the screen can place nodes with the same projection.
 * Run: npx tsx scripts/maps/build-age-maps.ts. The output is committed; the game ships
 * only these files, not the map libraries.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { AGES } from '../../src/content/campaign/ages';
import { BATTLE_BY_ID } from '../../src/content/campaign/battles';

const require = createRequire(import.meta.url);
const OUT = 'src/content/maps';
const WIDTH = 1200;

/** Rivers worth showing, as rough [lon, lat] polylines traced from the real courses. */
const RIVERS: { name: string; label: [number, number]; points: [number, number][] }[] = [
  {
    name: 'Nile',
    label: [31.0, 27.3],
    points: [
      [32.9, 24.1],
      [32.6, 25.7],
      [31.4, 27.2],
      [30.9, 28.6],
      [31.25, 30.05],
      [31.0, 30.6],
      [30.4, 31.4],
    ],
  },
  {
    name: 'Jordan',
    label: [35.75, 32.3],
    points: [
      [35.6, 33.2],
      [35.62, 32.7],
      [35.55, 32.2],
      [35.55, 31.8],
    ],
  },
  {
    name: 'Orontes',
    label: [36.7, 35.2],
    points: [
      [36.4, 34.1],
      [36.6, 34.6],
      [36.75, 35.1],
      [36.5, 35.8],
      [36.3, 36.1],
      [35.95, 36.05],
    ],
  },
  {
    name: 'Euphrates',
    label: [40.6, 34.9],
    points: [
      [38.4, 39.0],
      [38.3, 37.6],
      [38.2, 36.6],
      [39.0, 36.0],
      [40.2, 35.2],
      [41.4, 34.4],
      [42.8, 33.4],
      [44.3, 32.5],
      [45.8, 31.4],
      [47.4, 30.9],
      [48.5, 30.2],
    ],
  },
  {
    name: 'Tigris',
    label: [43.6, 35.4],
    points: [
      [40.2, 38.0],
      [42.2, 37.3],
      [43.1, 36.3],
      [43.6, 35.2],
      [44.4, 33.3],
      [45.6, 32.4],
      [47.0, 31.2],
      [47.4, 30.9],
    ],
  },
  {
    name: 'Halys',
    label: [34.6, 39.9],
    points: [
      [37.6, 39.8],
      [36.0, 39.1],
      [34.3, 39.3],
      [33.8, 40.4],
      [34.6, 41.3],
      [35.9, 41.7],
    ],
  },
  {
    name: 'Indus',
    label: [69.8, 28.6],
    points: [
      [74.5, 35.5],
      [72.9, 34.6],
      [72.2, 33.9],
      [71.6, 32.2],
      [70.6, 30.0],
      [69.0, 27.7],
      [68.2, 25.4],
      [67.5, 24.2],
    ],
  },
  {
    name: 'Hydaspes',
    label: [72.6, 30.9],
    points: [
      [73.9, 34.4],
      [73.5, 33.3],
      [73.4, 32.9],
      [72.7, 32.2],
      [72.1, 31.3],
    ],
  },
];

/** A few cities to orient the player. */
const CITIES: { name: string; lon: number; lat: number }[] = [
  { name: 'Memphis', lon: 31.25, lat: 29.85 },
  { name: 'Thebes', lon: 32.64, lat: 25.7 },
  { name: 'Damascus', lon: 36.29, lat: 33.51 },
  { name: 'Ugarit', lon: 35.79, lat: 35.6 },
  { name: 'Athens', lon: 23.73, lat: 37.98 },
  { name: 'Sparta', lon: 22.43, lat: 37.07 },
  { name: 'Pella', lon: 22.52, lat: 40.76 },
  { name: 'Sardis', lon: 28.04, lat: 38.49 },
  { name: 'Babylon', lon: 44.42, lat: 32.54 },
  { name: 'Nineveh', lon: 43.15, lat: 36.36 },
  { name: 'Susa', lon: 48.26, lat: 32.19 },
  { name: 'Persepolis', lon: 52.89, lat: 29.93 },
  { name: 'Taxila', lon: 72.8, lat: 33.75 },
];

const r1 = (n: number) => Math.round(n * 10) / 10;

function build(): void {
  mkdirSync(OUT, { recursive: true });
  for (const age of AGES.filter((a) => a.status === 'playable')) {
    const { west, east, south, north } = age.region;
    // The finer coastline, except for near-global maps.
    const span = east - west;
    const atlasFile = require.resolve(
      span > 120 ? 'world-atlas/land-110m.json' : 'world-atlas/land-50m.json',
    );
    const topo = JSON.parse(readFileSync(atlasFile, 'utf8')) as Topology<{
      land: GeometryCollection;
    }>;
    const land = feature(topo, topo.objects.land);
    const corners = {
      type: 'MultiPoint' as const,
      coordinates: [
        [west, south],
        [east, north],
        [west, north],
        [east, south],
      ],
    };
    const projection = geoMercator().fitWidth(WIDTH, corners);
    const [[, y0], [, y1]] = geoPath(projection).bounds(corners);
    const height = Math.round(y1 - y0);
    projection.translate([projection.translate()[0], projection.translate()[1] - y0]);
    projection.clipExtent([
      [0, 0],
      [WIDTH, height],
    ]);
    const path = geoPath(projection).digits(1);
    const landPath = path(land) ?? '';
    const inside = (lon: number, lat: number) =>
      lon > west && lon < east && lat > south && lat < north;
    const rivers = RIVERS.filter((r) => r.points.some(([lon, lat]) => inside(lon, lat)));
    const riverPaths = rivers
      .map((r) => path({ type: 'LineString', coordinates: r.points }) ?? '')
      .filter(Boolean);
    const project = (lon: number, lat: number) => {
      const p = projection([lon, lat])!;
      return [r1(p[0]), r1(p[1])] as [number, number];
    };

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="${WIDTH}" height="${height}" preserveAspectRatio="xMidYMid meet">
<rect class="sea" width="${WIDTH}" height="${height}"/>
<path class="land" d="${landPath}"/>
${riverPaths.map((d) => `<path class="river" d="${d}"/>`).join('\n')}
</svg>
`;
    const meta = {
      width: WIDTH,
      height,
      battles: Object.fromEntries(
        age.battles
          .map((id) => BATTLE_BY_ID[id])
          .filter((b) => !!b)
          .map((b) => [b!.id, project(b!.lon, b!.lat)]),
      ),
      cities: CITIES.filter((c) => inside(c.lon, c.lat)).map((c) => ({
        name: c.name,
        at: project(c.lon, c.lat),
      })),
      rivers: rivers
        .filter((r) => inside(r.label[0], r.label[1]))
        .map((r) => ({ name: r.name, at: project(r.label[0], r.label[1]) })),
    };
    writeFileSync(join(OUT, `age-${age.id}.svg`), svg);
    writeFileSync(join(OUT, `age-${age.id}.json`), JSON.stringify(meta, null, 2) + '\n');
    console.log(
      `age ${age.id}: ${WIDTH}×${height}, ${Math.round(svg.length / 1024)} KB svg, ${Object.keys(meta.battles).length} battles`,
    );
  }
}

build();
