# Security Policy

## Supported Versions

This project is currently in beta. Security fixes are applied to the latest version only.

| Version | Supported |
|---|---|
| Latest (main/React branch) | ✅ Yes |
| Older commits | ❌ No |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.**

If you discover a security vulnerability — including but not limited to authentication bypasses, privilege escalation, SQL injection, XSS, CSRF bypass, or exposure of user data — please report it privately so we can address it before it is publicly disclosed.

### How to Report

Send a detailed report to:

**Email:** llodgical018@gmail.com  
**Subject line:** `[SECURITY] <brief description>`

Please include as much of the following as you can:

- **Type of vulnerability** (e.g., authentication bypass, data exposure, XSS)
- **Affected component** (e.g., `/api/auth/signin`, the `participants` table, the frontend report form)
- **Steps to reproduce** the issue reliably
- **Potential impact** — what an attacker could do if they exploited this
- **Suggested fix** (optional but appreciated)
- **Your contact information** so we can follow up if needed

### What to Expect

| Timeframe | Action |
|---|---|
| Within 3 business days | Acknowledgment of your report |
| Within 14 days | Assessment of severity and a remediation plan |
| Within 90 days | A fix deployed to production (critical issues sooner) |

We will keep you informed throughout the process. Once the vulnerability is fixed, we are happy to credit you in the release notes if you would like.

---

## Scope

The following are **in scope** for security reports:

- The backend API (`functions/api/` and `functions/lib/`)
- Authentication and session management (`functions/api/auth/`, `functions/lib/auth.ts`)
- CSRF protection (`functions/lib/csrf.ts`)
- Database queries and potential injection issues (`schema.sql`, all `*.ts` files using `env.DB`)
- Authorization checks (admin-only routes, organizer-only actions)
- Content filtering bypass (server-side filter in `functions/api/posts/index.ts`)
- Rate limiting bypass (`functions/lib/rateLimit.ts`)
- The frontend React application (`src/`)
- The deployed site at `coloradospringscommunityservice.pages.dev`

The following are **not able to be reported to us**:

- Cloudflare infrastructure itself (report those to [Cloudflare](https://www.cloudflare.com/disclosure/))
- Third-party services (Nominatim/OpenStreetMap, Google/Outlook/Yahoo calendar links)
- Social engineering attacks against maintainers
- Physical security
- Denial of service through resource exhaustion since rate-limiting is already in place
- Bugs that require the attacker to already have admin access to the platform
- Issues in dependencies that have no practical exploitability in this application

---

## Known Security Measures

To help others understand the existing security posture:

- **Password hashing:** PBKDF2 with 100,000 iterations and a unique random salt per password. Accounts created before March 2026 used SHA-256 and are migrated on next sign-in.
- **Session management:** HTTP-only, Secure, SameSite=None cookies; sessions are invalidated on sign-out and expire after 7 days; IP binding with SHA-256 hashed IP storage.
- **CSRF protection:** Double-submit cookie pattern using `X-CSRF-Token` header for all mutating requests.
- **CORS:** Enforced allowlist; only the production domain and localhost are permitted origins.
- **Content filtering:** Server-side filter on all post creation and edit endpoints; cannot be bypassed by calling the API directly.
- **Rate limiting:** Login and signup endpoints are rate-limited (5 requests per 60 seconds per IP); reports are limited to 5 per day per user.
- **Admin authorization:** All `/api/admin/` routes verify both authentication and `isAdmin` flag server-side via middleware.
- **Input validation:** Required fields, datetime sanity checks, and category allowlists are enforced server-side.
- **Attendance history:** Preserved separately from posts to prevent data loss on deletion; uses `INSERT OR IGNORE` to prevent duplication.

---

## Disclosure Policy

We follow **coordinated disclosure**:

1. You report privately.
2. We confirm, assess, and develop a fix.
3. We deploy the fix.
4. We publicly acknowledge the issue (without sensitive details) in release notes.
5. You may publish your own write-up after the fix is deployed.

We ask that you give us at least **90 days** before public disclosure. For critical vulnerabilities actively being exploited, we will work to release a fix as quickly as possible.