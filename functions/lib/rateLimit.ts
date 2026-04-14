interface Env {
  RATE_LIMIT_KV?: KVNamespace;
}

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

export async function rateLimit(env: Env, options: RateLimitOptions): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;

  if (env.RATE_LIMIT_KV) {
    const existingRaw = await env.RATE_LIMIT_KV.get(options.key);
    const existing = existingRaw ? JSON.parse(existingRaw) as { count: number; resetAt: number } : null;
    const record = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

    record.count += 1;

    await env.RATE_LIMIT_KV.put(options.key, JSON.stringify(record), {
      expirationTtl: options.windowSeconds,
    });

    const allowed = record.count <= options.limit;
    return {
      allowed,
      remaining: Math.max(0, options.limit - record.count),
      retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  const current = inMemoryStore.get(options.key);
  const record = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  record.count += 1;
  inMemoryStore.set(options.key, record);

  const allowed = record.count <= options.limit;
  return {
    allowed,
    remaining: Math.max(0, options.limit - record.count),
    retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

export function getRequestIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}
