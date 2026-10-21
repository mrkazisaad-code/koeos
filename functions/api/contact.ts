/**
 * Cloudflare Pages Function adapter for POST /api/contact.
 * Environment: EMAIL_API_KEY, CONTACT_TO, CONTACT_FROM, RATE_SALT; optional RATE_KV (KV namespace)
 * and CONTACT_WEBHOOK_URL (used instead of the email API when set).
 */
import { handleContact } from '../../server/contact/handler';
import { memoryStore, type RateStore } from '../../server/contact/rate-limit';
import { emailApiDelivery, webhookDelivery } from '../../server/contact/delivery';

type KV = {
  get(k: string, type: 'json'): Promise<unknown>;
  put(k: string, v: string, o: { expirationTtl: number }): Promise<void>;
};
type Env = {
  EMAIL_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  CONTACT_WEBHOOK_URL?: string;
  RATE_SALT?: string;
  RATE_KV?: KV;
};

const fallbackStore = memoryStore();
const kvStore = (kv: KV): RateStore => ({
  get: async (k) => ((await kv.get(k, 'json')) as { count: number; reset: number } | null) ?? undefined,
  set: (k, v, ttl) => kv.put(k, JSON.stringify(v), { expirationTtl: Math.max(60, ttl) }),
});

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const deliver = env.CONTACT_WEBHOOK_URL
    ? webhookDelivery(env.CONTACT_WEBHOOK_URL)
    : emailApiDelivery({ apiKey: env.EMAIL_API_KEY ?? '', to: env.CONTACT_TO ?? '', from: env.CONTACT_FROM ?? '' });
  return handleContact(request, {
    deliver,
    store: env.RATE_KV ? kvStore(env.RATE_KV) : fallbackStore,
    salt: env.RATE_SALT ?? 'koeos',
    clientIp: request.headers.get('cf-connecting-ip') ?? '',
    allowedOrigins: ['https://www.koeos.io', 'https://koeos.io'],
  });
};
