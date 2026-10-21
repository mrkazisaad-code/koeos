import type { ContactInput } from './validate';

/**
 * Delivery adapters. The handler only calls `deliver(message)`; nothing is stored.
 * Replace or add an adapter to change provider.
 */
export type Deliver = (m: ContactInput) => Promise<void>;

const asText = (m: ContactInput) =>
  [
    `Name: ${m.name}`,
    `Organisation: ${m.organisation}`,
    `Email: ${m.email}`,
    `Starting from: ${m.starting_point || '—'}`,
    '',
    m.message,
  ].join('\n');

/** Transactional email over HTTPS (Resend-compatible API). Choose an EU-region account. */
export function emailApiDelivery(opts: { apiKey: string; to: string; from: string; endpoint?: string }): Deliver {
  return async (m) => {
    const res = await fetch(opts.endpoint ?? 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${opts.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: opts.from,
        to: [opts.to],
        reply_to: m.email,
        subject: `Website enquiry: ${m.organisation}`,
        text: asText(m),
      }),
    });
    if (!res.ok) throw new Error(`Email API responded ${res.status}`);
  };
}

/** Generic webhook (any form/automation service that accepts JSON). */
export function webhookDelivery(url: string): Deliver {
  return async (m) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  };
}

/** Local development only: logs to the console. */
export const consoleDelivery: Deliver = async (m) => {
  console.log('[contact] would deliver:\n' + asText(m));
};
