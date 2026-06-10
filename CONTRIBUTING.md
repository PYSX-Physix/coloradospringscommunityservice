# Contributing to Colorado Springs Community Service Hub

This project is community driven and will require contributions to improve, fix, and add new features. Thank you for looking into contributing to this project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Contact](#contact)

---

## Code of Conduct

By participating in this project, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

Before you start, please check:

1. **Existing issues** — someone may already be working on what you have in mind.
2. **Open pull requests** — to avoid duplicate work.
3. **The README** — to understand the project's purpose and scope.

If you plan to work on something non-trivial, **open an issue first** to discuss your approach. This prevents wasted effort and ensures alignment with the project's goals.

---

## Development Setup

### Prerequisites

- **Node.js** v20 or later
- **npm** v8 or later
- A [Cloudflare](https://cloudflare.com) account (for deploying with Workers/Pages/D1)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) for local backend development

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/cospringscs-react-vite.git
cd cospringscs-react-vite

# 2. Install dependencies
npm install

# 3. Copy the example environment file (if one is provided)
#    Never commit real secrets or API keys

# 4. Start the development server (frontend only)
npm run dev

# 5. To run the full stack locally with Cloudflare Workers:
npx wrangler pages dev dist --d1 DB=<your-local-db-id>
```

> **Note:** The backend runs as Cloudflare Pages Functions. You will need a D1 database bound as `DB` and a KV namespace bound as `Rate_Limits` for full local testing. See `wrangler.toml` for binding names.

### Database Setup (Local)

```bash
# Apply the schema to a local D1 database
npx wrangler d1 execute <DB_NAME> --local --file=schema.sql
```

---

## How to Contribute

### 1. Create a Branch

Always work on a new branch, never directly on `main` or `React`.

```bash
git checkout -b fix/issue-42-share-link
```

### 2. Make Your Changes

- Keep changes focused. One pull request = one logical change.
- Add or update tests where applicable.
- Run the linter before pushing: `npm run lint`

### 3. Push and Open a Pull Request

```bash
git push origin fix/issue-42-share-link
```

Then open a pull request against the `React` branch on GitHub.

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Bug fix | `fix/<short-description>` | `fix/delete-event-auth` |
| New feature | `feat/<short-description>` | `feat/email-notifications` |
| Documentation | `docs/<short-description>` | `docs/update-readme` |
| Refactor | `refactor/<short-description>` | `refactor/posts-component` |
| Chore/config | `chore/<short-description>` | `chore/update-deps` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short summary>

[optional body]

[optional footer]
```

**Types:** `fix`, `feat`, `docs`, `refactor`, `chore`, `test`, `style`

**Examples:**

```
fix(auth): include credentials on delete event request
feat(notifications): add email reminder support
docs: update development setup instructions
```

Keep the first line under 72 characters. Use the body to explain *why*, not just *what*.

---

## Pull Request Process

1. Fill out the pull request template completely.
2. Link any related issues using `Closes #<issue-number>`.
3. Ensure `npm run lint` passes with no errors.
4. Keep the PR focused — avoid unrelated changes in the same PR.
5. Be responsive to review feedback; PRs with no activity for 30 days may be closed.
6. A maintainer will review and merge once approved.

### What Makes a Good PR

- Clear title and description explaining the change and motivation
- Small, reviewable diff (large PRs are hard to review and slow to merge)
- No commented-out code or debug logging left in
- No changes to `wrangler.toml` database IDs or production secrets

---

## Coding Standards

This project uses TypeScript with strict mode enabled. Please follow the patterns already established in the codebase.

### General

- **TypeScript** — all new code must be typed; avoid `any` where possible
- **Functional React components** with hooks; no class components
- **Fluent UI v9** (`@fluentui/react-components`) for all UI elements — do not introduce other component libraries
- Keep components small and focused; extract logic into custom hooks under `src/hooks/`
- Co-locate types with the code that uses them, or add shared types to `src/utils/types.ts`

### Backend (Cloudflare Pages Functions)

- All API routes live under `functions/api/`
- Shared utilities (auth, cors, csrf, rate limiting) live under `functions/lib/`
- Always validate input server-side — do not rely on client-side validation alone
- Use `corsJson()` from `functions/lib/cors.ts` for all JSON responses
- Authenticate using `getSession()` from `functions/lib/auth.ts`
- Never log sensitive data (passwords, tokens, full session objects)

### Security

- Do not introduce new dependencies without discussion — keep the bundle lean
- Never commit secrets, API keys, or database IDs to source control
- CSRF protection is already in place for mutating requests — do not bypass it
- Content filtering runs server-side; client-side filtering is supplementary only

### Linting

```bash
npm run lint
```

The project uses ESLint with TypeScript rules. All warnings are treated as errors in CI.

---

## Reporting Bugs

Use the **Bug Report** issue template. Please include:

- A clear description of the bug and what you expected to happen
- Steps to reproduce reliably
- Browser, OS, and version information
- Console errors or screenshots if applicable

For **security vulnerabilities**, do **not** open a public issue. See [SECURITY.md](SECURITY.md).

---

## Suggesting Features

Use the **Feature Request** issue template. Please include:

- The problem your feature solves
- Your proposed solution
- Any alternatives you considered
- Whether you're willing to implement it yourself

Features that align with the project's mission (centralizing community service opportunities in Colorado Springs) are most likely to be accepted.

---

## Contact

For contribution-related questions, open an issue or reach out via the contact information on the [About page](https://coloradospringscommunityservice.pages.dev/about).