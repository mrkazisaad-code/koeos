/**
 * Sources for figures, in the order the spec lists them (section 10).
 * `review` marks entries the spec says must be confirmed or replaced before publishing;
 * `npm run check:content` reports them on every build.
 */
export type Source = {
  n: number;
  title: string;
  publisher: string;
  date: string;
  url: string;
  supports: string;
  review?: string;
  /** Non-blocking reminder shown after each build. */
  note?: string;
  also?: { label: string; url: string };
};

export const SOURCES: Source[] = [
  {
    n: 1,
    title: 'Use of artificial intelligence in enterprises',
    publisher: 'Eurostat',
    date: 'December 2025',
    url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php/Use_of_artificial_intelligence_in_enterprises',
    supports: '20% of EU enterprises used AI in 2025; 55% of large firms, 17% of small ones.',
  },
  {
    n: 2,
    title: 'Services: The New Software',
    publisher: 'Sequoia Capital',
    date: '2026',
    url: 'https://sequoiacap.com/',
    supports: 'Argument that buyers pay for the finished service.',
    // Kept as is by owner decision (Oct 2026); reported as a non-blocking note.
    note: 'Article URL and date not verified; link points to the publisher home page.',
  },
  {
    n: 3,
    title: 'Global situation of undertakings for collective investment at the end of August 2026',
    publisher: 'CSSF',
    date: 'October 2026',
    url: 'https://www.cssf.lu/en/2026/10/global-situation-of-undertakings-for-collective-investment-at-the-end-of-august-2026/',
    supports: 'Net assets of Luxembourg investment funds: €6.79tn on 31 August 2026.',
  },
  {
    n: 4,
    title: 'Note de conjoncture 2-2025: labour market',
    publisher: 'STATEC',
    date: '2025',
    url: 'https://statistiques.public.lu/dam-assets/catalogue-publications/note-conjoncture/2025/ndc2-25/ndc-2-25-act-marche-travail-04.pdf',
    supports: '2024 data: 235,134 of 516,026 jobs in Luxembourg held by cross-border workers (45%).',
  },
  {
    n: 5,
    title: '€300m to foster innovation and fund start-ups',
    publisher: 'SNCI action plan, via Paperjam',
    date: 'March 2025',
    url: 'https://en.paperjam.lu/article/eu300m-to-foster-innovation-and-fund-start-ups',
    supports: 'Extra SNCI financing of €300m over five years for start-ups and innovation.',
  },
];

export const source = (n: number) => {
  const s = SOURCES.find((x) => x.n === n);
  if (!s) throw new Error(`Unknown source ${n}`);
  return s;
};
