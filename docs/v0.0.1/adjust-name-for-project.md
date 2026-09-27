# Adjust name for project

## Currently

The project is named **"orange"** across the codebase:

- Root [package.json](package.json) — `"name": "orange"`
- Workspace packages scoped as `@orange/*`: [apps/frontend/package.json](apps/frontend/package.json), [apps/backend/package.json](apps/backend/package.json), [packages/eslint-config/package.json](packages/eslint-config/package.json), [packages/language/package.json](packages/language/package.json), [packages/tsconfig/package.json](packages/tsconfig/package.json), [packages/shared-types/package.json](packages/shared-types/package.json)
- [README.md](README.md) — title "Orange - Translation project"
- Frontend page metadata title in [apps/frontend/src/app/layout.tsx:7](apps/frontend/src/app/layout.tsx#L7) — `"Orange"`

## Acceptance Criteria

- [x] Rename DictionaryEntry into DictionaryTerm
- [x] Remove DictionaryContext and context in DictionaryTerm

## Solutions

- [x] Rename for model and all code related
