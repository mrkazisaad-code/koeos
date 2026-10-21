/**
 * Site-wide configuration. Values marked OWNER_CONFIRM must be confirmed
 * before public release (see README, "Before launch").
 */

/** OWNER_CONFIRM: spec shows both [hello@koeos.io] (placeholder) and info@koeos.io (section 11 copy). */
export const CONTACT_EMAIL = 'info@koeos.io';

/** OWNER_CONFIRM: LinkedIn URL from section 11 of the spec. */
export const LINKEDIN_URL = 'https://www.linkedin.com/company/koeos-ventures/';

/** Form submission endpoint. Swap for any provider that accepts the same POST fields. */
export const CONTACT_ENDPOINT = '/api/contact';

/** Matches the GitHub Pages custom domain (koeos.io). The spec names www.koeos.io; change both together. */
export const SITE_URL = 'https://koeos.io/';

export const SITE_TITLE = 'Koeos — Venture building, commercialisation and AI, from Luxembourg';

export const SITE_DESCRIPTION =
  'Koeos builds the product, the offer and the operating model around technology, and takes it to paying customers in Europe. Operator-led, based in Luxembourg.';

/**
 * Content flags for claims that needed owner confirmation (both confirmed, Oct 2026).
 * ACQUISITION_WORDING_CONFIRMED: shows “through the company’s acquisition” on the logistics card.
 */
export const CONTENT_FLAGS = {
  ACQUISITION_WORDING_CONFIRMED: true,
  /** Confirmed by the owner, Oct 2026. */
  TEAM_180_CONFIRMED: true,
} as const;

export const NAV_LINKS = [
  { href: '#what', num: '03', label: 'What we do' },
  { href: '#how', num: '04', label: 'How we work' },
  { href: '#where', num: '06', label: 'Where' },
  { href: '#engage', num: '09', label: 'Engagement' },
  { href: '#record', num: '10', label: 'Track record' },
] as const;
