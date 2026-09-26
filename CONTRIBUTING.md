# Contributing to Orange

Orange is a translation (i18n) management tool: a dictionary/glossary manager with AI-assisted
translation and automated commit/MR generation. See [CLAUDE.md](./CLAUDE.md) for the full feature
spec.

## Prerequisites

- Node.js >= 20
- pnpm (`corepack enable` will pick up the version pinned in `package.json`)
- Docker + Docker Compose (for Postgres, Meilisearch, Ollama)

## Monorepo layout

This is a Turborepo managed with pnpm workspaces.

```
apps/
  backend/    NestJS API — auth, dictionary, language, translation, commit-job, search modules
  frontend/   Next.js app — dashboard UI, NextAuth, zustand stores, tanstack/query services
packages/
  shared-types/  Types shared between backend and frontend
  tsconfig/       Base tsconfig presets (base/nestjs/nextjs)
  eslint-config/  Shared eslint config
docker/
  docker-compose.yml  Postgres, Meilisearch, Ollama services
```

Each backend feature lives under `apps/backend/src/modules/<feature>` as a
`module.ts` / `controller.ts` / `service.ts` triad. Each frontend feature has a matching
folder under `apps/frontend/src/features/<feature>`, with routes in `src/app`, API calls in
`src/services`, and client state in `src/stores`.

## Getting started

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
pnpm docker:up          # starts Postgres, Meilisearch, Ollama
pnpm --filter @orange/backend prisma:migrate
pnpm dev                # runs backend + frontend via turbo
```

The frontend proxies `/rest/*` to the backend (see `apps/frontend/next.config.js`), so the
browser only ever talks to the Next.js origin — no CORS setup needed. The backend's global
prefix is also `rest` (`app.setGlobalPrefix("rest")` in `main.ts`), so paths match 1:1 end to
end. This keeps the backend namespace separate from `/api/auth/*`, which NextAuth owns.

## Code style

- TypeScript strict mode; avoid `any`, prefer `unknown` at boundaries.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Favor early returns over nested conditionals.
- Keep modules independent: the commit-job feature must not depend on dictionary internals
  and vice versa — integrate through shared types/services only.

## Git conventions

- Branch naming: `{initials}/{short-description}` (e.g. `nd/dictionary-crud`)
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
  `docs:`, `refactor:`, `chore:`, ...)
- PR titles follow the same convention as commit messages.
- Keep PRs scoped to one module/feature where possible.

## Environment variables

See `apps/backend/.env.example` and `apps/frontend/.env.example` for the full list. Notable
ones:

| Variable | App | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection string (Prisma) |
| `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY` | backend | Search engine used for translation ranking |
| `OLLAMA_HOST` / `OLLAMA_MODEL` | backend | Local AI model used for auto-translation |
| `BACKEND_URL` | frontend | Server-side target for the `/rest/*` rewrite |
| `NEXT_PUBLIC_API_URL` | frontend | Client-side base path (`/rest`) |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | frontend | NextAuth base site URL and signing secret |

## Pull requests

1. Rebase on latest `main` before opening a PR.
2. Ensure `pnpm lint` and `pnpm typecheck` pass for any package you touched.
3. Describe *why* the change is needed, not just what changed.
