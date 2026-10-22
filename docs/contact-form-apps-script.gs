/**
 * Koeos website contact form: validates, filters spam, emails the enquiry. Stores nothing.
 * Deployed as a Google Apps Script web app (Execute as: Me, Who has access: Anyone).
 * Script property RECIPIENT holds the inbox that receives enquiries.
 * After editing: Deploy > Manage deployments > pencil > Version: New version > Deploy (keeps the URL).
 */
const LIMITS = { name: 200, organisation: 200, email: 254, message: 1500 };
const STARTING_POINTS = ['Investor or venture builder', 'Technology group entering Europe', 'Large organisation',
  'Professional-services firm', 'Founder or research team', 'Other'];
// Older option labels are mapped to the new ones so every enquiry is labelled the same way
const LEGACY_STARTING_POINTS = { 'Group entering Europe': 'Technology group entering Europe', 'Large enterprise': 'Large organisation' };
const MAX_PER_HOUR = 20;      // across the whole site
const MAX_PER_EMAIL_HOUR = 3; // per sender address
const SITE = 'https://koeos.io/';

function doPost(e) {
  const p = parse_(e);
  const json = p._format === 'json';
  if (p.website) return reply_(json, 200, { ok: true });           // honeypot: bots get a fake success
  const errors = validate_(p);
  if (Object.keys(errors).length) return reply_(json, 422, { ok: false, errors });
  if (!allow_(p.email)) return reply_(json, 429, { ok: false, error: 'rate_limited' });
  const to = PropertiesService.getScriptProperties().getProperty('RECIPIENT');
  MailApp.sendEmail({
    to, replyTo: p.email, name: 'Koeos website',
    subject: 'Website enquiry: ' + p.organisation,
    body: ['Name: ' + p.name, 'Organisation: ' + p.organisation, 'Email: ' + p.email,
           'Starting from: ' + (p.starting_point || 'Not given'), '', p.message].join('\n'),
  });
  return reply_(json, 200, { ok: true });
}

function parse_(e) {
  // Running doPost from the editor passes no event; treat that as an empty form
  let raw = (e && e.parameter) || {};
  try { if (e && e.postData && e.postData.type === 'text/plain') raw = JSON.parse(e.postData.contents); } catch (err) {}
  const s = (k) => (typeof raw[k] === 'string' ? raw[k].trim() : '');
  let start = s('starting_point');
  start = LEGACY_STARTING_POINTS[start] || start;
  return { name: s('name'), organisation: s('organisation'), email: s('email'), message: s('message'),
           starting_point: STARTING_POINTS.indexOf(start) >= 0 ? start : '',
           website: s('website'), _format: s('_format') };
}

function validate_(p) {
  const e = {};
  if (!p.name) e.name = 'Please add your name.'; else if (p.name.length > LIMITS.name) e.name = 'Please shorten your name.';
  if (!p.organisation) e.organisation = 'Please add your organisation.'; else if (p.organisation.length > LIMITS.organisation) e.organisation = 'Please shorten your organisation.';
  if (!p.email) e.email = 'Please add your email.'; else if (p.email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email)) e.email = 'Please add a valid email address.';
  if (!p.message) e.message = 'Please add a few lines about what should be earning.'; else if (p.message.length > LIMITS.message) e.message = 'Please keep this to 1,500 characters or fewer.';
  return e;
}

function allow_(email) {
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    const cache = CacheService.getScriptCache();
    const hour = Math.floor(Date.now() / 3600000);
    const hash = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email.toLowerCase()));
    const keys = ['all-' + hour, 'em-' + hour + '-' + hash];
    const got = cache.getAll(keys);
    const all = Number(got[keys[0]] || 0), mine = Number(got[keys[1]] || 0);
    if (all >= MAX_PER_HOUR || mine >= MAX_PER_EMAIL_HOUR) return false;
    cache.putAll({ [keys[0]]: String(all + 1), [keys[1]]: String(mine + 1) }, 3600);
    return true;
  } finally { lock.releaseLock(); }
}

function reply_(json, status, body) {
  if (json) return ContentService.createTextOutput(JSON.stringify(Object.assign({ status }, body)))
    .setMimeType(ContentService.MimeType.JSON);
  const msg = body.ok ? 'Thank you. We will reply within two business days.'
    : status === 429 ? 'Too many messages. Please try again later, or email info@koeos.io.'
    : 'Please check the form: ' + Object.values(body.errors || {}).join(' ');
  return HtmlService.createHtmlOutput('<p style="font:17px Arial;padding:40px">' + msg +
    '</p><p style="font:17px Arial;padding:0 40px"><a href="' + SITE + '">Back to Koeos</a></p>');
}

/** Run once from the editor to check that delivery works. */
function testSend() {
  MailApp.sendEmail(PropertiesService.getScriptProperties().getProperty('RECIPIENT'),
    'Koeos form test', 'If you can read this, the contact form can send email.');
}
