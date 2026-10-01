# CONTRIBUTING

## Code Style

- TypeScript strict mode enabled
- Prefer `interface` over `type` (except unions/intersections)
- No `any` - use `unknown` instead
- Use early returns, avoid nested conditionals
- Prefer composition over inheritance

## Git Conventions

- **Branch naming**: `{initials}/{description}` (e.g., `feat/fix-login`)
- **Commit format**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **PR titles**: Same as commit format

## Database

- Prisma using models in `apps/backend/prisma/schema.prisma`

## Critical Rules - Must apply

- Avoid run project
- Avoid run eslint, typecheck.
- Avoid using generic words in function names.
- If exist `TASK.md`, mark completed tasks.
- Read `./docs` as context

## Ticket rules

- `Currently` **IS ALWAYS** the current state; it **CAN AND WILL** change based on `Acceptance Criteria` requirements.
- `Acceptance Criteria` **IS MANDATORY** and **MUST ALWAYS** be fulfilled — **NO EXCEPTIONS**.
- `Acceptance Criteria` **IS MANDATORY**: **ANY** ambiguity **MUST ALWAYS** be clarified by asking the user again. **NEVER** guess or infer on your own.
- `Solutions` **ONLY** an initial proposal and **MUST ALWAYS** be re-evaluated and reviewed before being treated as final.
- `Changelogs` **ONLY** record changes that have already happened — **NEVER** treat them as requirements.
- `Changelogs` **ONLY** record changes that have already happened — **NEVER** feel obligated to preserve them as-is.
- `Changelogs` **ONLY** record changes that have already happened — **NEVER** let them affect the output result.
