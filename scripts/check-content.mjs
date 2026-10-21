// Content guardrails run after every build. `--release` fails while owner items are open.
import { readFileSync } from 'node:fs';

const release = process.argv.includes('--release');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#39;|&rsquo;/g, '’')
  .replace(/\s+/g, ' ');
const attrs = [...html.matchAll(/(?:aria-label|alt|content|title)="([^"]*)"/g)].map((m) => m[1]).join(' ');
const all = `${text} ${attrs}`;

const errors = [];
const check = (re, why) => {
  const m = all.match(re);
  if (m) errors.push(`${why}: “${m[0]}”`);
};
check(/\b(SHIPSTA|Cloud Primero|Deloitte|Aegir)\b/i, 'Forbidden name');
check(/\b(I|I’m|I've|I’ve|my|me|mine|myself)\b(?![-’])/, 'First person singular');
check(/\b(delve|navigate|robust|pivotal|foster|tapestry|unlock|seamless|synergy|world-class|best-in-class|leading)\b/i, 'Banned phrasing');
check(/not only/i, 'Banned phrasing');
check(/hello@koeos\.io/, 'Placeholder email');
check(/koeoes/, 'Misspelled domain');
for (const fig of ['20%', '72%', '€418bn', '~€2.7tn', '€2tn', '14% of GDP', '$20.3bn', '1,284', '20+', '180']) {
  if (!text.includes(fig)) errors.push(`Final figure missing from HTML: ${fig}`);
}
const markers = (html.match(/class="src"/g) ?? []).length;
if (markers < 9) errors.push(`Expected at least 9 source markers, found ${markers}`);

const src = readFileSync(new URL('../src/data/sources.ts', import.meta.url), 'utf8');
const site = readFileSync(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const open = [];
const notes = [];
for (const block of src.split(/\n  \{\n/).slice(1)) {
  const n = block.match(/n: (\d+),/)?.[1];
  const review = block.match(/review: '([^']+)'/)?.[1];
  const note = block.match(/note: '([^']+)'/)?.[1];
  if (n && review) open.push(`Source ${n}: ${review}`);
  if (n && note) notes.push(`Source ${n}: ${note}`);
}
if (/ACQUISITION_WORDING_CONFIRMED: false/.test(site)) open.push('Track record: acquisition wording withheld until confirmed (CONTENT_FLAGS.ACQUISITION_WORDING_CONFIRMED).');
if (/TEAM_180_CONFIRMED: false/.test(site)) open.push('Track record: “180 people” needs owner confirmation (CONTENT_FLAGS.TEAM_180_CONFIRMED).');
notes.push('Contact email (info@koeos.io, as on the previous site) and LinkedIn URL: confirm (src/config/site.ts).');
notes.push('Contact form has no delivery provider yet: /api/contact does not exist on GitHub Pages (see README).');

if (errors.length) {
  console.error('\nContent check FAILED:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`\nContent check passed (${markers} source markers).`);
if (open.length) console.log('\nOpen owner items before release:\n- ' + open.join('\n- '));
if (notes.length) console.log('\nNotes (non-blocking):\n- ' + notes.join('\n- '));
if (release && open.length) process.exit(1);
