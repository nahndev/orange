# Add swagger docs for api

## Currently

The backend API (NestJS, under `apps/backend`) does not expose Swagger/OpenAPI documentation. Controllers such as `dictionary`, `translation`, and `search` have no generated API reference, making it harder for consumers and other developers to discover available endpoints, request/response shapes, and DTOs.

## Acceptance Criteria

- [x] Add swagger page in /docs

## Solutions

- [x] Add `@nestjs/swagger` to `apps/backend` and mount `SwaggerModule` at the `/docs` route in `main.ts` (kept separate from the `rest` global prefix)
- [x] Decorate existing DTOs (`dictionary`, `account`, `auth`, `translation`) with `@ApiProperty`/`@ApiPropertyOptional` so request bodies render correctly in the generated docs
- [x] Tag controllers with `@ApiTags` and mark JWT-guarded controllers with `@ApiBearerAuth` so the docs UI exposes an auth flow
