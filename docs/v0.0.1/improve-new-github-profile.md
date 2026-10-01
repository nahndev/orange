# Improve New GitHub profile

## Currently

The "New GitHub profile" card on `/dashboard/token` (`apps/frontend/src/app/dashboard/token/page.tsx`) renders `GithubProfileForm` inside `GithubSetupProvider` (`apps/frontend/src/features/github-profile/components/`). It sits below the "GitHub profiles" list.

- Fields, in order: Access token (`PasswordInput` + "Load repositories" button), Repository selector, Branch selector, Profile name.
- Flow: enter the token and press "Load repositories" (or Enter) -> `POST /github-profiles/repositories` fills the repository selector -> choosing a repository sets its default branch and loads `POST /github-profiles/branches` for the branch selector -> enter a name -> "Create profile".
- The repository and branch selectors stay disabled until their lists load. Their placeholders are "Enter a token to load repositories" and "Select a repository first".
- The profile name has no default (it is not prefilled from the chosen repository and branch) and is required only through the disabled submit button, with no validation message.
- Repositories are all loaded at once (every page of `GET /user/repos`) and shown in a plain selector, with no search or filter. Errors from loading repositories or branches are shown as raw messages under the field.
- After a successful create the form resets to the first step and the new profile appears in the list above.

The goal is to improve this "New GitHub profile" card.

## Acceptance Criteria

- [x] Every selector should start with button `Load <placehoder>`
- [x] Value of selector only load when click on button
- [x] Move profile name to top of button
- [x] Add check connect button

## Solutions

- [x] Update UI
- [x] Add new button and link to health endpoint
