const CSRF_COOKIE_NAME = 'csrf_token';

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) return null;

  const token = cookie.slice(CSRF_COOKIE_NAME.length + 1);
  return token ? decodeURIComponent(token) : null;
}

export function setCsrfCookie(token: string): void {
  if (typeof document === 'undefined' || !token) return;

  document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Secure`;
}

export function clearCsrfCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}

function needsCsrfHeader(method?: string): boolean {
  if (!method) return false;

  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

export function initializeCsrfFetch(): void {
  if (typeof window === 'undefined') return;

  const existing = (window as Window & { __csrfFetchInitialized?: boolean }).__csrfFetchInitialized;
  if (existing) return;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);

    if (needsCsrfHeader(request.method)) {
      const csrfToken = getCsrfTokenFromCookie();
      if (csrfToken) {
        const headers = new Headers(request.headers);
        headers.set('X-CSRF-Token', csrfToken);

        return nativeFetch(request, {
          headers,
        });
      }
    }

    return nativeFetch(request);
  };

  (window as Window & { __csrfFetchInitialized?: boolean }).__csrfFetchInitialized = true;
}
