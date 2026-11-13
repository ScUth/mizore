# AGENTS.md

Guidance for AI coding agents working in the Mizore repository.

## Overview

Mizore is a self-hosted file browser. Users log in, register **paths** (folders inside the server's shared roots), and browse or view the files in them (including PDFs) from a web UI.

| Directory        | What it is                                                        |
| ---------------- | ----------------------------------------------------------------- |
| `node_fastify/`  | Backend API: Fastify 5, plain JavaScript, ESM (`"type": "module"`) |
| `nextjs/`        | Frontend: Next.js 16 (App Router), React 19, MUI 9, TypeScript + some JSX |
| `postgres/`      | `init.sql` (schema) and `migrations/` (numbered SQL files)        |
| `dev/`           | Architecture and sequence diagrams (LaTeX sources + PDFs)         |
| `docker-compose.yml` | Runs postgres, backend, and frontend together                 |

`nextjs/AGENTS.md` has frontend-specific rules. **Read it before touching `nextjs/`:** this Next.js version differs from what you may know, so check `nextjs/node_modules/next/dist/docs/` before using Next APIs.

## Commands

Backend (`node_fastify/`):

```bash
npm i
npm test            # node --test over src/tests/integration/*.test.js
node server.js      # listens on $PORT (default 4000)
```

Frontend (`nextjs/`):

```bash
npm i
npm run dev         # http://localhost:3000
npm run build
npm run lint
```

Full stack: copy `.env.example` to `.env` at the repo root, then `docker compose up -d --build`.

## Backend architecture

Request flow: `routes/` → `controllers/` → `services/` → `models/` → `config/database.js` (`pg` Pool).

- `src/app.js` exports `buildApp()`; `server.js` only calls `listen`. Tests import `buildApp` directly, so keep app setup inside `buildApp()`.
- Routes are registered in `src/routes/index.js`. All API routes live under `/api/...`.
- Auth uses JWT (`src/utils/jwt.js`, `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`). Protect a route with `preHandler: [authControllers.authenticate]`, which sets `request.user`.
- Controllers validate input and map errors to HTTP status codes. Known validation errors are matched by `error.message` (e.g. `'Path is outside the shared folder'` → 400). If you change an error message in a service, update the controller and the tests that match on it.
- Error responses use the shape `{ error: string }`.
- Models (`src/models/`) hold raw parameterized SQL. Always use `$1, $2, ...` placeholders, never string interpolation.

### Shared folders (security-sensitive)

`src/config/storage.js` is the single source of truth for which host directories are reachable:

- `SHARED_FOLDERS` (comma-separated) or legacy `SHARED_FOLDER` define the allowed roots.
- **Every filesystem access based on user input must go through `resolveSharedPath()`.** It rejects anything outside the roots, and that check is what prevents path traversal. Do not call `fs` or `reply.sendFile` with a raw user path.
- `@fastify/static` is registered with `serve: false`; files are served only through `/api/files`, which checks the path first.
- Paths may be absolute (`/mnt/data/x`), absolute without a leading slash (the frontend strips it), or relative to the first root (legacy rows). Nested roots resolve to the most specific match.
- In Docker, each root must be bind-mounted with **target == source** so stored paths match host paths, and listed in `SHARED_FOLDERS`.

The frontend mirrors this logic in `nextjs/src/components/sidebar/utils.ts` (`groupPathsByRoot`). If you change root resolution on one side, change it on the other.

## Database

- Schema: `postgres/init.sql` runs only when the Postgres volume is first created.
- Tables: `users` (role defaults to `owner`), `paths` (`user_id`, `allowed_subpath`), `subUsers`.
- For a schema change, add a numbered file to `postgres/migrations/` (e.g. `002_*.sql`) using idempotent SQL (`IF NOT EXISTS`). Also update `init.sql` so fresh installs match.
- Rule: the app may have **at most one Owner** user.

## Frontend notes

- App Router pages live in `nextjs/src/app/`. The authenticated UI is under `app/admin/` (guarded by `admin/components/adminGuard.tsx`). File browsing is the catch-all route `admin/[...path]`.
- Global state (auth tokens, user, paths, roots, current path) is in `src/context/AppContext.jsx`. Use its `request()` helper for authenticated API calls instead of calling `fetch` directly.
- Tokens are kept in `localStorage` (`accessToken`, `refreshToken`, `authUser`).
- `/api/*` is proxied to the backend via rewrites in `next.config.ts` (`API_PROXY_TARGET`, default `http://localhost:4000`). Call relative `/api/...` URLs from the browser.
- React Compiler is enabled (`reactCompiler: true`), so manual `useMemo`/`useCallback` is usually unnecessary in new code.
- UI uses MUI components; follow the existing sidebar components (`src/components/sidebar/`) for style and structure.

## Testing

- Backend tests are integration tests using `node:test` + `app.inject()` (no real HTTP server).
- `src/tests/integration/setup.js` creates two temp shared roots, sets `SHARED_FOLDERS` **before** importing the app, and cleans up in `closeTestApp()`. Import `app` from `setup.js` and register `after(closeTestApp)` in new test files.
- Tests that reach the database need a running Postgres configured through `.env`.
- Run `npm test` in `node_fastify/` after backend changes, and `npm run lint` in `nextjs/` after frontend changes.

## Conventions

- Backend: ESM imports with explicit `.js` extensions, 4-space indent, no semicolons in most files (match the surrounding file).
- Frontend: 2-space indent, double quotes, semicolons.
- Never commit `.env` or real secrets; add new variables to `.env.example` and to `docker-compose.yml`.
- `docker-compose.yml` contains machine-specific bind mounts; do not change them unless asked.
