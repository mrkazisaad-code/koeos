/** Shared by the browser form and the server handler so both apply the same rules. */
export type ContactField = 'name' | 'organisation' | 'email' | 'message';
export type ContactInput = {
  name: string;
  organisation: string;
  email: string;
  starting_point: string;
  message: string;
};

export const LIMITS = { name: 200, organisation: 200, email: 254, message: 1500 } as const;
export const STARTING_POINTS = [
  'Investor or venture builder',
  'Group entering Europe',
  'Large enterprise',
  'Professional-services firm',
  'Founder or research team',
  'Other',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(raw: Record<string, unknown>) {
  const s = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string).trim() : '');
  const data: ContactInput = {
    name: s('name'),
    organisation: s('organisation'),
    email: s('email'),
    starting_point: s('starting_point'),
    message: s('message'),
  };
  const errors: Partial<Record<ContactField, string>> = {};
  if (!data.name) errors.name = 'Please add your name.';
  else if (data.name.length > LIMITS.name) errors.name = 'Please shorten your name.';
  if (!data.organisation) errors.organisation = 'Please add your organisation.';
  else if (data.organisation.length > LIMITS.organisation) errors.organisation = 'Please shorten your organisation.';
  if (!data.email) errors.email = 'Please add your email.';
  else if (data.email.length > LIMITS.email || !EMAIL_RE.test(data.email)) errors.email = 'Please add a valid email address.';
  if (!data.message) errors.message = 'Please add a few lines about what should be earning.';
  else if (data.message.length > LIMITS.message) errors.message = 'Please keep this to 1,500 characters or fewer.';
  if (data.starting_point && !STARTING_POINTS.includes(data.starting_point)) data.starting_point = '';
  return { ok: Object.keys(errors).length === 0, errors, data };
}
