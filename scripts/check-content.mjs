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
// Source titles are quoted as published (e.g. Paperjam’s “to foster innovation”), not our copy
const all = `${text} ${attrs}`.replace(/to foster innovation/g, '');
// Visible body text only (head, scripts and styles removed)
function body(h) {
  return h
    .replace(/<head>[\s\S]*?<\/head>/, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

const errors = [];
const check = (re, why) => {
  const m = all.match(re);
  if (m) errors.push(`${why}: “${m[0]}”`);
};
check(/\b(SHIPSTA|Cloud Primero|Deloitte|Aegir)\b/i, 'Forbidden name');
check(/Illustrative/, 'Illustrative label');
check(/1,284/, 'Illustrative outcome count');
check(/\b(I|I’m|I've|I’ve|my|me|mine|myself)\b(?![-’])/, 'First person singular');
check(/\b(delve|navigate|robust|pivotal|foster|tapestry|unlock|seamless|synergy|world-class|best-in-class|leading (?:firm|provider|company|expert|partner)s?)\b/i, 'Banned phrasing');
check(/not only/i, 'Banned phrasing');
check(/hello@koeos\.io/, 'Placeholder email');
check(/koeoes/, 'Misspelled domain');
for (const fig of ['20%', '55%', 'against 17% of small ones', '€6.79tn', '45%', '€300m', '20+', '25+', '€200m+', '12+', '100+ people']) {
  if (!text.includes(fig)) errors.push(`Final figure missing from HTML: ${fig}`);
}
const markers = (html.match(/class="src"/g) ?? []).length;
if (markers !== 6) errors.push(`Expected 6 source markers, found ${markers}`);
// Counters are read once by text tools: no hidden duplicate copies
for (const dup of ['2020', '2525', '55 companies', '22 exits', '99 products']) if (text.includes(dup)) errors.push(`Counter read twice: ${dup}`);
// No em dashes in body copy (the <title> sits in the head and is excluded)
if (/—/.test(body(html))) errors.push('Em dash in body copy');
// Section 07 no longer ranks countries on the map
const europe = html.slice(html.indexOf('id="europe"'), html.indexOf('id="who"'));
const mapOnly = europe.slice(0, europe.indexOf('europe__side'));
if (/GERMANY|LARGEST|\bNEXT\b|\bLATER\b|Germany is|largest market/i.test(mapOnly.replace(/<[^>]+>/g, ' '))) errors.push('Country ranking left in section 07 map');
// The list renders twice: the footer dialog and its no-JS fallback
const sourceCount = (html.match(/class="source-list__n"/g) ?? []).length / 2;
if (sourceCount !== 5) errors.push(`Sources list should have 5 entries, found ${sourceCount}`);

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
notes.push('Contact email (info@koeos.io, as on the previous site): confirm (src/config/site.ts). LinkedIn URL confirmed 22 Oct 2026.');
notes.push('Contact form has no delivery provider yet: /api/contact does not exist on GitHub Pages (see README).');

if (errors.length) {
  console.error('\nContent check FAILED:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`\nContent check passed (${markers} source markers).`);
if (open.length) console.log('\nOpen owner items before release:\n- ' + open.join('\n- '));
if (notes.length) console.log('\nNotes (non-blocking):\n- ' + notes.join('\n- '));
if (release && open.length) process.exit(1);
