const APP_DOMAIN = "coloradospringscommunityservice.pages.dev";

const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, X-CSRF-Token";

function isAllowedOrigin(origin: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (hostname === APP_DOMAIN) {
    return true;
  }

  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    return true;
  }

  if ((hostname === "localhost" || hostname === "127.0.0.1") && parsed.protocol === "http:") {
    return true;
  }

  return false;
}

export function buildCorsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("Origin");

  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    headers.set("Vary", "Origin");
  }

  return headers;
}

export function corsJson(request: Request, body: unknown, status = 200, initHeaders?: HeadersInit): Response {
  const headers = buildCorsHeaders(request);
  headers.set("Content-Type", "application/json");

  if (initHeaders) {
    new Headers(initHeaders).forEach((value, key) => headers.set(key, value));
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export function handleCorsPreflight(request: Request): Response {
  const origin = request.headers.get("Origin");
  if (!origin || !isAllowedOrigin(origin)) {
    return new Response("Origin not allowed", { status: 403 });
  }

  return new Response(null, { headers: buildCorsHeaders(request) });
}

export function isCorsOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return true;
  }

  return isAllowedOrigin(origin);
}
