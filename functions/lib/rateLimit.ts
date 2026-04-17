interface Env {
  Rate_Limits?: KVNamespace;
}

type RateLimitOptions = {
  limit: number;
  window: number; // seconds
  keyPrefix: string;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const inMemoryStore = new Map<string, RateLimitRecord>();

function getRequestIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

export async function rateLimit(
  request: Request,
  env: Env,
  options: RateLimitOptions,
): Promise<Response | null> {
  const ip = getRequestIp(request);
  const key = `${options.keyPrefix}:${ip}`;
  const now = Date.now();
  const windowMs = options.window * 1000;

  if (env.Rate_Limits) {
    const raw = await env.Rate_Limits.get(key);
    const existing = raw ? (JSON.parse(raw) as RateLimitRecord) : null;
    const record = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

    record.count += 1;

    await env.Rate_Limits.put(key, JSON.stringify(record), {
      expirationTtl: options.window,
    });

    if (record.count > options.limit) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.max(1, Math.ceil((record.resetAt - now) / 1000))),
        },
      });
    }

    return null;
  }

  const current = inMemoryStore.get(key);
  const record = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  record.count += 1;
  
  inMemoryStore.set(key, record);

  if (record.count > options.limit) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, Math.ceil((record.resetAt - now) / 1000))),
      },
    });
  }

  return null;
}