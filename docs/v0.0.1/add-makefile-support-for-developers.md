# Add Makefile support for developers

## Currently

- The repository has no `Makefile`.
- Developers run common tasks through npm scripts in the root `package.json` (`build`, `dev`, `lint`, `test`, `typecheck`, `docker:up`, `docker:down`), which delegate to `turbo` and `docker compose -f docker/docker-compose.yml`.
- There is no single, discoverable entry point listing the available commands, so new developers need to read `package.json` and the docker folder to learn them.

## Acceptance Criteria

- [x] Add comment open website on chrome (front-end)
- [x] Add comment run prisma migrate + prisma generate
- [x] Add comment open backend rest api docs

## Solutions

- [x] Root `Makefile` with `help` (default goal, lists targets from `##` comments).
- [x] `open-web` / `open-api-docs`: `xdg-open` on `http://localhost:3000` and `http://localhost:3001/docs` (overridable via `WEB_URL`, `API_DOCS_URL`). Default browser is used instead of Chrome, as agreed.
- [x] `prisma-sync`: `pnpm --filter @orange/backend prisma:migrate` then `prisma:generate`.
