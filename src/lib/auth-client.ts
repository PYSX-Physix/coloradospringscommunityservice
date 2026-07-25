import React from 'react';
import { clearCsrfCookie, setCsrfCookie } from './csrf-helpers';

export async function signUp(email: string, password: string, name: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }

  return res.json();
}

export type SignInResult =
  | { requires2FA: true; challengeId: string; expiresAt: number }
  | { requires2FA?: false; success: true; csrfToken: string; user: SessionUser };

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
};

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }

  const data = await res.json();
  if (data?.csrfToken) {
    setCsrfCookie(data.csrfToken);
  }

  return data;
}

// Redeems a login challenge with a TOTP code (or recovery code as a
// fallback) and, on success, establishes the authenticated session — the
// same way signIn() does for accounts without 2FA enabled.
export async function verifyTwoFactorLogin(params: {
  challengeId: string;
  code?: string;
  recoveryCode?: string;
}) {
  const res = await fetch("/api/auth/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Verification failed");
  }

  if (data?.csrfToken) {
    setCsrfCookie(data.csrfToken);
  }

  return data as { success: true; csrfToken: string; user: SessionUser };
}

export type TwoFactorSetupData = { qrCode: string; secret: string; otpauthUrl: string };

export async function startTwoFactorSetup(): Promise<TwoFactorSetupData> {
  const res = await fetch("/api/auth/2fa/setup", { method: "POST", credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to start setup");
  return data;
}

export async function confirmTwoFactorSetup(code: string): Promise<{ success: true; recoveryCodes: string[] }> {
  const res = await fetch("/api/auth/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Verification failed");
  return data;
}

export async function disableTwoFactor(params: {
  password: string;
  code?: string;
  recoveryCode?: string;
}): Promise<{ success: true }> {
  const res = await fetch("/api/auth/2fa/disable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to disable two-factor authentication");
  return data;
}

export async function getRecoveryCodesStatus(): Promise<{ remaining: number }> {
  const res = await fetch("/api/auth/2fa/recovery", { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load recovery code status");
  return data;
}

export async function regenerateRecoveryCodes(password: string): Promise<{ success: true; recoveryCodes: string[] }> {
  const res = await fetch("/api/auth/2fa/recovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to regenerate recovery codes");
  return data;
}

export async function signOut() {
  await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });
  clearCsrfCookie();
}

export async function getSession() {
  const res = await fetch("/api/auth/session", { credentials: "include" });
  return res.json();
}

export function useSession() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getSession().then(data => {
      if (data?.session?.csrfToken) {
        setCsrfCookie(data.session.csrfToken);
      }
      setSession(data.session);
      setLoading(false);
    });
  }, []);

  return { data: session, isPending: loading };
}