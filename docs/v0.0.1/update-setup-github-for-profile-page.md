# Update setup GitHub for profile page

## Currently

The `/profile` page (`apps/frontend/src/app/profile/page.tsx`) has a "GitHub" card ("Connect a GitHub repository to your account.") that renders `GithubConnectionSetup` (`apps/frontend/src/features/account/components/github-connection-setup.tsx`), which wraps the props-driven `GithubConnectForm` (`apps/frontend/src/features/account/components/github-connect-form.tsx`).

- The form has 4 fields: Owner, Repository, Branch (defaults to `main`) and Access token (`PasswordInput`; optional when a token is already stored).
- Actions: Connect / Save changes, Check connection and Disconnect (the last two only when already connected).
- Feedback: a generic "Failed to update GitHub connection." error, and "Connection is healthy." / "Connection check failed." after a health check.

The GitHub setup on the profile page needs to be updated.

## Acceptance Criteria

- [x] First enter token
- [x] Load repositories base on token - show selector
- [x] Load branch - show selector

## Solutions

- [x] Using GithubSetupProvider
- [x] Using endpoint allow call api base on github token
- [x] Load and show all selector
