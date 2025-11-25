import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "file:local.db"
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    "http://localhost:8788",
    "http://localhost:3000",
    "https://*.coloradospringscommunityservice.pages.dev", // Allow all subdomains
  ],
});

export type Session = typeof auth.$Infer.Session;