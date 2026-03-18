# Canton MVP — Developer commands
# Use `make help` for targets

.PHONY: help install setup build dev clean lint test docker-up docker-down

help:
	@echo "Canton MVP — Available targets"
	@echo ""
	@echo "  make install     Install dependencies (pnpm install)"
	@echo "  make setup       Full setup (install + build)"
	@echo "  make build       Build all packages and apps"
	@echo "  make dev         Start all dev servers (turbo)"
	@echo "  make dev-web     Start web app only"
	@echo "  make dev-api     Start API server only"
	@echo "  make dev-admin   Start admin app only"
	@echo "  make dev-docs    Start docs site only"
	@echo "  make lint        Lint all packages"
	@echo "  make lint-fix    Lint and fix"
	@echo "  make test        Run tests"
	@echo "  make clean       Clean all build artifacts"
	@echo "  make docker-up   Start Docker services (LocalNet placeholder)"
	@echo "  make docker-down Stop Docker services"
	@echo "  make overlay-bootstrap   Bootstrap Quickstart overlay env"
	@echo "  make overlay-validate   Validate Quickstart overlay services"
	@echo ""

install:
	pnpm install

setup: install build
	@echo "Setup complete. Run 'make dev' to start development."

build:
	pnpm build

dev:
	pnpm dev

dev-web:
	pnpm dev:web

dev-api:
	pnpm dev:api

dev-admin:
	pnpm dev:admin

dev-docs:
	pnpm dev:docs

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix
	pnpm format

test:
	pnpm test

clean:
	pnpm clean

docker-up:
	@echo "Docker: Add your LocalNet compose target here."
	@echo "Example: docker compose -f docker/compose.yaml up -d"

docker-down:
	@echo "Docker: Add your LocalNet compose target here."
	docker compose down 2>/dev/null || true

overlay-bootstrap:
	./integrations/quickstart-overlay/scripts/bootstrap.sh

overlay-validate:
	./integrations/quickstart-overlay/scripts/validate-services.sh
