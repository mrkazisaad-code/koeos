/**
 * Fixed-window rate limiter. The in-memory store is per instance; on a multi-instance host
 * swap `store` for a shared one (e.g. a KV namespace) with the same get/set shape.
 * Keys are a salted hash of the client IP, never the raw address, and expire with the window.
 */
export type RateStore = {
  get(key: string): Promise<{ count: number; reset: number } | undefined>;
  set(key: string, value: { count: number; reset: number }, ttlSeconds: number): Promise<void>;
};

export function memoryStore(): RateStore {
  const m = new Map<string, { count: number; reset: number }>();
  return {
    async get(k) {
      const v = m.get(k);
      if (v && v.reset < Date.now()) {
        m.delete(k);
        return undefined;
      }
      return v;
    },
    async set(k, v) {
      m.set(k, v);
      if (m.size > 5000) for (const [key, val] of m) if (val.reset < Date.now()) m.delete(key);
    },
  };
}

export async function hashKey(ip: string, salt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(buf).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function rateLimit(store: RateStore, key: string, limit = 5, windowSeconds = 600) {
  const now = Date.now();
  const cur = await store.get(key);
  if (!cur || cur.reset < now) {
    await store.set(key, { count: 1, reset: now + windowSeconds * 1000 }, windowSeconds);
    return { ok: true };
  }
  if (cur.count >= limit) return { ok: false, retryAfter: Math.ceil((cur.reset - now) / 1000) };
  await store.set(key, { count: cur.count + 1, reset: cur.reset }, Math.ceil((cur.reset - now) / 1000));
  return { ok: true };
}
