# Support multiple profile for GitHub

## Currently

Each user can have only one GitHub connection. It is stored directly on the `User` model (`apps/backend/prisma/schema.prisma`) as 4 nullable columns: `githubOwner`, `githubRepo`, `githubBranch`, `githubTokenEncrypted`. `User` implements `GithubConnectable`, so the whole user is the connection.

- Backend: `GithubConnectionController` / `GithubConnectionService` (`apps/backend/src/modules/github/`) expose `GET/PUT/DELETE /account/github` and `GET /account/github/health`, plus `POST /account/github/repositories` and `POST /account/github/branches` to load selectors from a token. Saving replaces the single connection; there is no way to keep a second one.
- Profile page (`/profile`): one "GitHub" card with `GithubSetupProvider` + `GithubConnectForm` (token, repository selector, branch selector). Connecting again overwrites the previous repository, branch and token.
- Commit jobs: `CommitJobConfig` has no GitHub reference. `CommitJobRunner` calls the provider with `config.user`, so every commit job always pushes to the user's single connection.

The goal is to let a user keep multiple GitHub profiles (e.g. different repositories, branches or tokens) instead of just one.

## Acceptance Criteria

- [x] Github setting should base on application instead of user
- [x] Should support multiple profile, every profile only support a repo, a branch
- [x] Add new menu `/dashboard/token`

## Solutions

- [x] Create new models `GithubProfile` implement `GithubConnectable`
- [x] Extract records of `User` into github profiles
- [x] Support multiple profiles (on application)
- [x] Build UI for `token` page include list of `GithubProfile`
- [x] Update models `CommitJobConfig` link to `connector: GithubProfile` instead of `user`
- [x] Update job page support profile selector
