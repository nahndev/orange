.DEFAULT_GOAL := help

WEB_URL ?= http://localhost:3000
API_DOCS_URL ?= http://localhost:3001/docs

.PHONY: help open-web prisma-sync open-api-docs

help: ## List available commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-16s %s\n", $$1, $$2}'

open-web: ## Open the frontend website in the default browser
	xdg-open $(WEB_URL)

prisma-sync: ## Run prisma migrate dev, then prisma generate
	pnpm --filter @orange/backend prisma:migrate
	pnpm --filter @orange/backend prisma:generate

open-api-docs: ## Open the backend REST API docs (Swagger) in the default browser
	xdg-open $(API_DOCS_URL)
