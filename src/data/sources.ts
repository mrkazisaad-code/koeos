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
    supports: '20% of EU enterprises; 55% large, 17% small.',
  },
  {
    n: 2,
    title: 'Open Innovation Report 2025',
    publisher: 'Sopra Steria',
    date: 'April 2025',
    url: 'https://www.soprasteria.com/newsroom/publications/details/7-in-10-european-companies-judge-startup-collaboration-as-vital-to-their-ai-strategy-reveals-a-sopra-steria-report',
    supports: '72% of large European organisations work with startups; many proofs of concept never reach deployment.',
  },
  {
    n: 3,
    title: 'Services: The New Software',
    publisher: 'Sequoia Capital',
    date: '2026',
    url: 'https://sequoiacap.com/',
    supports: 'Argument that buyers pay for the finished service.',
    // Kept as is by owner decision (Oct 2026); reported as a non-blocking note.
    note: 'Article URL and date not verified; link points to the publisher home page.',
  },
  {
    n: 4,
    title: 'EU defence spending €418 billion in 2025, projected €454 billion in 2026',
    publisher: 'European Defence Agency',
    date: 'July 2026',
    url: 'https://eda.europa.eu/news-and-events/news/2026/07/16/eu-defence-spending---418-billion-in-2025--projected-to--454-billion-in-2026',
    supports: 'Up to €547bn by 2029.',
  },
  {
    n: 5,
    title: 'EU member state comparisons 2024',
    publisher: 'CSO Ireland, using Eurostat data; Eurostat via Brussels Times',
    date: '2024',
    url: 'https://www.cso.ie/en/releasesandpublications/ep/p-naova/outputandvalueaddedbyactivity2024/eumemberstatecomparisons',
    supports: 'Manufacturing share and EU GDP, from which ~€2.7tn is calculated. Approximate.',
    also: { label: 'Eurostat via Brussels Times', url: 'https://www.brusselstimes.com/2261095/eu-gdp-hits-e18-8-trillion-as-wealth-gaps-between-nations-persist' },
  },
  {
    n: 6,
    title: 'Biggest market at the heart of Europe',
    publisher: 'GTAI',
    date: 'Undated',
    url: 'https://www.gtai.de/en/invest/business-location-germany/biggest-market-at-the-heart-of-europe-769776',
    supports: 'Germany’s 29% of EU manufacturing value added.',
  },
  {
    n: 7,
    title: 'Public procurement',
    publisher: 'European Commission, DG Defence Industry and Space',
    date: 'Undated',
    url: 'https://defence-industry-space.ec.europa.eu/funding-opportunities/public-procurement_en',
    supports: 'Around 14% of GDP, around €2 trillion per year.',
  },
  {
    n: 8,
    title: '2026 European Deeptech Report',
    publisher: 'Lakestar, Walden Catalyst and Dealroom, via Tech.eu',
    date: 'March 2026',
    url: 'https://tech.eu/2026/03/24/the-2026-european-deeptech-report-sector-reaches-690b-as-vc-share-hits-record/',
    supports: '$20.3bn, 32% of European VC.',
  },
  {
    n: 9,
    title: 'State of the financial sector 2025',
    publisher: 'Luxembourg for Finance',
    date: '2025',
    url: 'https://lff.foleon.com/brochures/state-of-the-financial-sector-2025/executive-summary',
    supports: 'Finance about 30% of Luxembourg’s value added, 2024.',
  },
];

export const source = (n: number) => {
  const s = SOURCES.find((x) => x.n === n);
  if (!s) throw new Error(`Unknown source ${n}`);
  return s;
};
