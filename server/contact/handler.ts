import { validateContact } from './validate';
import { hashKey, rateLimit, type RateStore } from './rate-limit';
import type { Deliver } from './delivery';

/**
 * Provider-agnostic contact handler using web-standard Request/Response.
 * Accepts JSON (enhanced form) or urlencoded/multipart (no-JS form post).
 */
export type HandlerDeps = {
  deliver: Deliver;
  store: RateStore;
  salt: string;
  clientIp: string;
  allowedOrigins?: string[];
};

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });

const page = (status: number, title: string, body: string) =>
  new Response(
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} — Koeos</title><style>body{margin:0;background:#0B1113;color:#E8EEEC;font:17px/1.55 Arial,sans-serif}main{max-width:620px;margin:0 auto;padding:96px 20px}h1{font-size:30px;line-height:1.2;margin:0 0 24px}li{color:#F0C49C}a{color:#6FC3B8}</style></head><body><main>${body}</main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function handleContact(req: Request, deps: HandlerDeps): Promise<Response> {
  if (req.method !== 'POST') return json(405, { ok: false }, { Allow: 'POST' });
  const wantsJson = (req.headers.get('content-type') ?? '').includes('application/json');

  const origin = req.headers.get('origin');
  if (origin && deps.allowedOrigins?.length && !deps.allowedOrigins.includes(origin)) return json(403, { ok: false });

  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > 16_000) return json(413, { ok: false });

  let raw: Record<string, unknown> = {};
  try {
    if (wantsJson) raw = (await req.json()) as Record<string, unknown>;
    else raw = Object.fromEntries((await req.formData()).entries());
  } catch {
    return json(400, { ok: false });
  }

  // Honeypot: pretend success so bots learn nothing
  if (typeof raw.website === 'string' && raw.website.trim() !== '') {
    return wantsJson ? json(200, { ok: true }) : page(200, 'Thank you', '<h1>Thank you. We will reply within two business days.</h1>');
  }

  const limited = await rateLimit(deps.store, await hashKey(deps.clientIp || 'unknown', deps.salt));
  if (!limited.ok) {
    const headers = { 'Retry-After': String(limited.retryAfter ?? 600) };
    return wantsJson
      ? json(429, { ok: false }, headers)
      : page(429, 'Please try later', '<h1>Too many messages from this connection.</h1><p>Please try again later.</p><p><a href="/#contact">Back</a></p>');
  }

  const { ok, errors, data } = validateContact(raw);
  if (!ok) {
    if (wantsJson) return json(422, { ok: false, errors });
    const items = Object.values(errors).map((e) => `<li>${esc(e!)}</li>`).join('');
    return page(422, 'Please check the form', `<h1>Please check the form.</h1><ul>${items}</ul><p><a href="/#contact">Back to the form</a></p>`);
  }

  try {
    await deps.deliver(data);
  } catch (err) {
    console.error('[contact] delivery failed', err);
    return wantsJson
      ? json(502, { ok: false })
      : page(502, 'Not sent', '<h1>The message could not be sent.</h1><p><a href="/#contact">Back to the form</a></p>');
  }
  return wantsJson
    ? json(200, { ok: true })
    : page(200, 'Thank you', '<h1>Thank you. We will reply within two business days.</h1><p><a href="/">Back to Koeos</a></p>');
}
