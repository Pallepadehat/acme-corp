<div align="center">

# Acme Corp

**A fast, full-stack TypeScript starter.**

React, Fastify and Postgres in one monorepo, with sign-in, a job queue and
tests already wired together. Clone it, run four commands, and start building
your product instead of your setup.

<!-- template:start -->
[![CI](https://github.com/Pallepadehat/acme-corp/actions/workflows/ci.yml/badge.svg)](https://github.com/Pallepadehat/acme-corp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
<!-- template:end -->

[Quick start](#quick-start) · [What's inside](#whats-inside) · [Why it's fast](#why-its-fast) · [Guides](#guides) · [Deploying](#deploying)

</div>

---

<!-- template:start -->
## Use this template

Click **Use this template** on GitHub, or clone it:

```bash
git clone https://github.com/Pallepadehat/acme-corp.git my-app
cd my-app
bun install
bun run rename my-app                     # or: bun run rename my-app --title "My App"
```

`rename` renames the packages (`@acme-corp/*` → `@my-app/*`), what people see
("Acme Corp" → "My App") and the database (`acme_corp` → `my_app`), then removes
this section and the badges. Add `--dry-run` to see what would change first.

<!-- template:end -->

## Quick start

You need [Bun](https://bun.sh), [Node.js 24](https://nodejs.org) and [Docker](https://www.docker.com).

```bash
bun install
cp .env.example .env    # then set BETTER_AUTH_SECRET: openssl rand -base64 32
bun db:up               # Postgres and Redis, in Docker
bun db:migrate          # create the tables
bun dev                 # app on http://localhost:3000
```

Create an account and add a todo. The todo list is the example feature: it
shows every layer working together. Replace it with your own.

## What's inside

| | |
|---|---|
| **Frontend** | [React 19](https://react.dev) with [React Compiler](https://react.dev/learn/react-compiler), [Vite](https://vite.dev), [TanStack Router](https://tanstack.com/router) (file-based, fully typed), [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| **Backend** | [Fastify](https://fastify.dev), [Zod](https://zod.dev), [Pino](https://getpino.io), running on Node.js 24's built-in TypeScript support |
| **Database** | [PostgreSQL](https://www.postgresql.org) with [Drizzle ORM](https://orm.drizzle.team) and its migrations |
| **Auth** | [Better Auth](https://www.better-auth.com): email and password, sessions, ready for social and SSO sign-in |
| **Jobs** | [BullMQ](https://bullmq.io) on [Redis](https://redis.io) |
| **Testing** | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com), [Playwright](https://playwright.dev), and [PGlite](https://pglite.dev) for a real Postgres inside your tests |
| **Tooling** | [Bun](https://bun.sh), [Turborepo](https://turborepo.com), [TypeScript 7](https://www.typescriptlang.org) (strict), [Biome](https://biomejs.dev), [Knip](https://knip.dev), [Lefthook](https://lefthook.dev) |
| **Also included** | Light and dark mode, English and Danish (with type-checked translation keys), GitHub Actions CI |

## Why it's fast

Speed is built in, not left as an exercise. Every number below was measured on
the production build of the example app.

**For your users**

- **Small first load.** About 130 KB of compressed JavaScript for the sign-in
  page. Every page is its own chunk, and libraries only load on the page that
  needs them: the auth client only on sign-in, Zod not at all in the browser.
- **No waterfalls.** An inline script in the HTML asks who is signed in while
  the JavaScript is still downloading. By the time the app starts, the answer
  is usually already there.
- **Instant navigation.** Pages preload when you hover a link, and the session
  is checked once per visit, not on every page.
- **No needless re-renders.** React Compiler memoizes components for you.
- **Compressed ahead of time.** Every asset is written as Brotli and gzip at
  build time, at the highest compression levels, and served as-is.
- **Cached forever, updated instantly.** Hashed assets are cached for a year.
  React, the router and i18n live in their own files, so a deploy that only
  changes your code doesn't make anybody re-download them. `index.html` is
  revalidated on every visit, so deploys are picked up immediately.
- **No flash.** The theme is set before the first paint, and there are no web
  fonts to wait for.

**For your server**

- **No database query to check a session.** Sessions are read from a signed
  cookie for five minutes at a time.
- **Indexed lookups.** Every column the app searches by has an index.
- **One process, one origin.** In production the API serves the app as well,
  so there is no CORS preflight on any request.

**For you**

- **No build step in development.** Node runs the API's TypeScript directly,
  and Vite serves the app.
- **Fast checks.** Biome, the native TypeScript 7 compiler and Turborepo's
  cache make the full check suite take seconds.
- **Fast tests without Docker.** Database tests run against a real Postgres
  inside the test process. It is migrated once, then copied for each test.

## Project structure

```
apps/
  web/                    the React app
    src/routes/           one file per page; folders become URLs
    src/components/       your components; ui/ holds shadcn/ui
    src/i18n/             translations (en.ts defines the keys)
  api/                    the Fastify server
    src/app.ts            builds the app; nothing connects until main.ts
    src/routes/           one file per resource
    src/jobs.ts           background jobs
packages/
  db/                     Drizzle schema, migrations, test database
  contract/               Zod schemas shared by the app and the API
e2e/                      Playwright tests
```

## Scripts

| Command | |
|---|---|
| `bun dev` | Start the app and the API with live reload |
| `bun run check` | Lint, typecheck, test, build and find unused code. Run it before you push |
| `bun run test` | Unit and integration tests |
| `bun run test:e2e` | Browser tests against the production build (no Docker needed) |
| `bun lint:fix` | Format and fix everything |
| `bun db:generate` | Create a migration from your schema changes |
| `bun db:migrate` | Apply migrations |
| `bun --filter @acme-corp/db db:studio` | Browse your data in Drizzle Studio |
| `bun run rename <name>` | Rename the project and its packages |

## Guides

<details>
<summary><b>Add a page</b></summary>

Create a file in `apps/web/src/routes/`. Its path is its URL:

```tsx
// apps/web/src/routes/_authed/settings.tsx  →  /settings
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/settings')({
  component: () => <h1>Settings</h1>,
})
```

The dev server picks it up instantly. Pages inside `_authed/` require a
signed-in user. Load data with a `loader`, and it is fetched in parallel with
the page's code and preloaded on hover.

</details>

<details>
<summary><b>Add a table</b></summary>

1. Define it in `packages/db/src/schema/` and export it from `schema/index.ts`.
2. Run `bun db:generate` to write the migration, then `bun db:migrate`.

Never edit a migration that has already been applied: generate a new one.

</details>

<details>
<summary><b>Add an API endpoint</b></summary>

Add a route file in `apps/api/src/routes/` and register it in `app.ts`. Put
request and response shapes in `packages/contract`, so the app and the API
cannot drift apart. Start each handler with `requireUser()`, and include
`userId` in every query, so another user's data reads as "not found".

</details>

<details>
<summary><b>Add a background job</b></summary>

Add a method to the `Jobs` interface in `apps/api/src/jobs.ts`, enqueue it from
a route, and handle it in the worker. Tests pass a fake, so they never need
Redis. When jobs get heavy, move the worker into its own process.

</details>

<details>
<summary><b>Add a UI component</b></summary>

```bash
cd apps/web && bunx shadcn@latest add dialog
```

</details>

<details>
<summary><b>Add a language</b></summary>

Copy `apps/web/src/i18n/da.ts`, translate it, and register it in `config.ts`.
A missing or misspelled key is a compile error, not a blank on screen.

</details>

<details>
<summary><b>Add social sign-in or SSO</b></summary>

Add providers to `createAuth()` in `apps/api/src/auth.ts`. See Better Auth's
[social providers](https://www.better-auth.com/docs/concepts/oauth) and the
[generic OAuth plugin](https://www.better-auth.com/docs/plugins/generic-oauth)
for any OpenID Connect provider.

</details>

## Testing

```bash
bun run test       # Vitest: database, API and components
bun run test:e2e   # Playwright: real browser, production build
```

API tests call the real app through `app.inject()` against a real, migrated
Postgres (PGlite), so they cover your SQL, constraints and auth without
mocks or Docker. Playwright runs against the production build, served the way
production serves it.

## Deploying

```bash
bun install --frozen-lockfile
bun run build
bun db:migrate
NODE_ENV=production bun --filter @acme-corp/api start
```

In production the API serves the built app, so you deploy one process on one
port. Set the variables from [`.env.example`](.env.example). Put a TLS-terminating
proxy or load balancer in front, and run the BullMQ worker in its own process
once your jobs need it.

## License

[MIT](LICENSE)
