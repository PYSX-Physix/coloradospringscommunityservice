import React from 'react';

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

export async function signIn(email: string, password: string) {
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
  
  return res.json();
}

export async function signOut() {
  await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getSession() {
  const res = await fetch("/api/auth/session", {
    credentials: "include",
  });
  const data = await res.json();
  
  // Ensure email_verified is included
  if (data.session?.user) {
    return {
      ...data,
      session: {
        ...data.session,
        user: {
          ...data.session.user,
          email_verified: data.session.user.isAdmin ? 1 : (data.session.user.email_verified || 0)
        }
      }
    };
  }
  return data;
}

export function useSession() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getSession().then(data => {
      setSession(data.session);
      setLoading(false);
    });
  }, []);

  return { data: session, isPending: loading };
}