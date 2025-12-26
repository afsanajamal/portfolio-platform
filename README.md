# Portfolio Platform

A production-quality full-stack portfolio management system built with Next.js and FastAPI in a monorepo architecture.

## Projects

- **Web** (`apps/web`): Next.js 14 frontend with TypeScript, Tailwind CSS, and i18n
- **API** (`apps/api`): FastAPI backend with PostgreSQL, JWT auth, and RBAC

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.13+
- Docker & Docker Compose (for PostgreSQL)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup API:**
   ```bash
   cd apps/api
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   docker-compose up -d
   alembic upgrade head
   PYTHONPATH=. python scripts/seed_admin.py
   cd ../..
   ```

3. **Configure environment:**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

   Update `apps/api/.env` with your database credentials and JWT secret if needed.

4. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both frontend (http://localhost:3000) and backend (http://127.0.0.1:8000).

## Available Commands

- `npm run dev` - Start both web and API in parallel
- `npm run dev:web` - Start only frontend
- `npm run dev:api` - Start only API
- `npm run build` - Build all projects
- `npm run test` - Run all tests
- `npm run test:web` - Run frontend tests only
- `npm run test:api` - Run API tests only
- `npm run lint` - Lint all projects

## Test Accounts

For testing purposes, use these accounts (seeded via `scripts/seed_admin.py`):

| Role   | Email                    | Password      |
|--------|--------------------------|---------------|
| Admin  | admin@example.com        | admin12345    |
| Editor | editor@example.com       | editor12345   |
| Viewer | viewer@example.com       | viewer12345   |

## Documentation

### Monorepo Documentation

- [**Architecture Overview**](docs/ARCHITECTURE.md) - System architecture and component interactions
- [**Development Workflow**](docs/DEVELOPMENT.md) - Daily development practices and workflows
- [**Integration Guide**](docs/INTEGRATION.md) - Frontend-backend integration and API contracts
- [**Contributing Guidelines**](docs/CONTRIBUTING.md) - Code standards and PR process
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Production deployment instructions
- [**Environment Variables**](docs/ENVIRONMENT.md) - Complete environment configuration reference
- [**Troubleshooting**](docs/TROUBLESHOOTING.md) - Common issues and solutions

### Application-Specific Documentation

- [**Web (Frontend)**](apps/web/README.md) - Next.js application documentation
- [**API (Backend)**](apps/api/README.md) - FastAPI application documentation

## Tech Stack

### Frontend (apps/web)
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- UI Library: React 18
- Styling: Tailwind CSS + shadcn/ui components
- Internationalization: next-intl (English/Japanese)
- Authentication: JWT (Access + Refresh tokens)
- Testing: Vitest (unit) + Playwright (E2E)

### Backend (apps/api)
- Framework: FastAPI
- Language: Python 3.13
- Database: PostgreSQL
- ORM: SQLAlchemy 2.0
- Migrations: Alembic
- Authentication: JWT (Access + Refresh tokens)
- Password Hashing: Argon2
- Testing: Pytest

## Features

- JWT-based authentication with automatic token refresh
- Role-based access control (Admin, Editor, Viewer)
- Multi-tenant organization support
- Project management with CRUD operations
- Tag-based categorization
- Audit logging for sensitive actions
- Full internationalization (English/Japanese)
- Comprehensive test coverage (unit + E2E)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
