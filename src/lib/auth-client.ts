import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://react-dev-accounts.coloradospringscommunityservice.pages.dev", // Change for production
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;