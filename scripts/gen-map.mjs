// Build-time generator for the A7 Europe outline map.
// Produces projected SVG path data and anchor points; no runtime map code ships.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { mesh } from 'topojson-client';
import { presimplify, simplify, quantile } from 'topojson-simplify';
import { geoConicConformal, geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
const simplified = simplify(presimplify(topo), quantile(presimplify(topo), 0.12));
const lines = mesh(simplified, simplified.objects.countries);

const places = {
  lu: [6.13, 49.61],
  de: [10.2, 51.2],
  fr: [2.4, 46.9],
  nl: [5.4, 52.3],
  be: [4.4, 50.65],
  uk: [-1.6, 52.6],
  emea: [33, 34],
  us: [-40, 47],
};

// Each variant is a crop of the same projection, sized so labels render near 11px.
const variants = {
  wide: { width: 640, height: 560, bounds: [[-10.5, 40.5], [22, 59.5]] },
  compact: { width: 340, height: 380, bounds: [[-6.5, 43.2], [16.5, 56.8]] },
};

const round = (d) => d.replace(/(\d+)\.\d+/g, '$1');
const out = {};
for (const [name, v] of Object.entries(variants)) {
  const projection = geoConicConformal().parallels([44, 60]).rotate([-8, 0]);
  const frame = {
    type: 'Feature',
    geometry: {
      type: 'MultiPoint',
      coordinates: [v.bounds[0], v.bounds[1], [v.bounds[0][0], v.bounds[1][1]], [v.bounds[1][0], v.bounds[0][1]]],
    },
  };
  projection.fitExtent([[0, 0], [v.width, v.height]], frame);
  projection.clipExtent([[-2, -2], [v.width + 2, v.height + 2]]);
  const path = geoPath(projection);
  const pts = {};
  for (const [k, ll] of Object.entries(places)) {
    const p = geoConicConformal().parallels([44, 60]).rotate([-8, 0]).scale(projection.scale()).translate(projection.translate())(ll);
    pts[k] = [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];
  }
  out[name] = { width: v.width, height: v.height, outline: round(path(lines) || ''), points: pts };
}
writeFileSync(new URL('../src/data/europe-map.json', import.meta.url), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k, (v.outline.length / 1024).toFixed(1) + 'KB', JSON.stringify(v.points));
