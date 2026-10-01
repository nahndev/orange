# Add commit jobs feature

## Currently

- A `commit-job` backend module already exists (`apps/backend/src/modules/commit-job/{commit-job.module.ts,commit-job.controller.ts,commit-job.service.ts}`) and is registered in `app.module.ts`, but it is an empty scaffold: `CommitJobService` has no methods and `CommitJobController` has no routes.
- `apps/backend/prisma/schema.prisma` only has a placeholder comment (`// Glossary, CommitJobConfig, CommitJob will be defined here.`) — no `CommitJob`/`CommitJobConfig` Prisma models exist yet.
- The frontend already has a "Jobs" nav entry (`apps/frontend/src/components/layout/header.tsx`) linking to `/dashboard/commit-jobs`, which renders a static page (`apps/frontend/src/app/dashboard/commit-jobs/page.tsx`) with the text "No commit jobs yet." and no data fetching.
- `GithubConnectable` and `GithubProviderInterface` (`apps/backend/src/modules/github/`) already exist and are implemented by `GithubApiProvider`. `createCommit(conn, input)` is fully synchronous today (Octokit calls awaited inline: getRef → getCommit → createTree → createCommit → updateRef), returning the resulting `sha` in the same request.
- `createCommit` and `createChangeRequest` currently have no callers anywhere in the codebase — only `isHealthy` is used (by `account.service.ts` for the health-check endpoint).
- There is no job/queue infrastructure in the project (no BullMQ, Redis, cron, or worker process in any `package.json` or in `docker/docker-compose.yml`).

## Acceptance Criteria

- [x] Build new feature allow user setup jobs
- [x] Every job include trigger (current only support for when changes)
- [x] When DictionarySentence -> run job -> create MR

Clarified with the user:

- A job uses the GitHub connection of the user who created it (`/profile`).
- The trigger fires when a `DictionarySentence` of the job's dictionary is created, updated or deleted.
- A run writes one JSON file per language (path configurable per job, with a `{language}` placeholder).
- Runs execute in-process (no new queue infrastructure); every run creates its own branch, commit and MR.

## Solutions

- [x] Add new models and CRUD endpoints — `CommitJobConfig` (job setup) and `CommitJob` (one run) + migration; `GET/POST /commit-jobs`, `GET/PATCH/DELETE /commit-jobs/:id`, `GET /commit-jobs/:id/runs`
- [x] Add new event thought, when DictionarySentence changes -> emit -> jobs loading and filter -> apply job — in-process `DictionaryEvents` (no event-emitter package in the project); `CommitJobRunner` listens, loads enabled `SENTENCE_CHANGED` configs of the dictionary and runs them
- [x] Build flow allow create MR — `GithubProvider.createBranch` added; run = createBranch → createCommit (on that branch) → createChangeRequest; result (or error) stored on the `CommitJob` run
- [x] UI: `/dashboard/commit-jobs` — create job, list, enable/disable, delete, run history
- [ ] Sentence **delete** trigger: there is no delete-sentence API/service method yet (sentences are only removed by the dictionary cascade), so only `created`/`updated` are emitted. Needs a delete-sentence endpoint (+ search index removal) to emit `deleted`.
- [ ] Run `pnpm prisma generate` and apply the migration `20261001130000_commit_jobs` (not run here: project rules forbid running the project/typecheck).

File content format (decision made during implementation): each file is `{ "<sentenceId>": "<text in that language>" }`, sentences ordered by creation time.
