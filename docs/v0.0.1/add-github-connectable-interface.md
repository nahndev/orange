# Add GithubConnectable interface so entities can be connected to GitHub, with UI and API to configure it

## Currently

There is no GitHub integration in the project. No entity can be linked to a GitHub repository, and there is no UI or API to configure such a connection.

The goal is to introduce a `GithubConnectable` interface that an entity (e.g. a user) can extend to declare that it supports a GitHub connection, plus a UI and an API that allow configuring that connection.

## Acceptance Criteria

- [x] Build UI for setup to connect with props
- [x] In /profile page add setup UI for github

## Solutions

- [x] Build interface `GithubConnectable` -> user implement this interface
- [x] token of github is stored encrypted (AES-256-GCM, key derived from `GITHUB_TOKEN_SEED`; reversible so the provider can use it — confirmed deviation from "hash")
- [x] Build interface `GithubProvider`
- [x] - isHealthy(GithubConnectable conn) - Check connect
- [x] - createCommit(GithubConnectable conn, CommitInput input) - Create 1 commit
- [x] - createChangeRequest(GithubConnectable conn, ChangeRequestInput input) - Create MR
- [x] Prisma: `User` gets `githubOwner`, `githubRepo`, `githubBranch`, `githubTokenEncrypted` + migration
- [x] API: `GET/PUT/DELETE /account/github`, `GET /account/github/health`
- [x] UI: generic `GithubConnectForm` (props-driven) + `GithubConnectionSetup` wired into `/profile`
