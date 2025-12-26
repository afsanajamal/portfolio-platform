# Development Workflow

This guide covers best practices and workflows for developing across both frontend and backend applications in this monorepo.

## Table of Contents

- [Daily Development Workflow](#daily-development-workflow)
- [Monorepo Commands](#monorepo-commands)
- [Working with Both Apps](#working-with-both-apps)
- [Database Workflows](#database-workflows)
- [Testing Workflows](#testing-workflows)
- [Debugging Tips](#debugging-tips)
- [Common Tasks](#common-tasks)

## Daily Development Workflow

### Starting Your Day

1. **Pull latest changes**:
```bash
git pull origin main
```

2. **Install any new dependencies**:
```bash
# Root level (installs all workspace dependencies)
npm install

# Backend dependencies (if requirements.txt changed)
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
```

3. **Run database migrations** (if any):
```bash
cd apps/api
alembic upgrade head
```

4. **Start development servers**:
```bash
# From root directory
npm run dev

# Or individually
npm run dev:web   # Frontend only
npm run dev:api   # Backend only
```

### During Development

- **Frontend** runs on: http://localhost:3000
- **Backend** runs on: http://127.0.0.1:8000
- **Backend docs** available at: http://127.0.0.1:8000/docs (Swagger UI)

### Before Committing

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Check for type errors (frontend)
cd apps/web && npm run type-check
```

## Monorepo Commands

All commands can be run from the root directory:

### Development

```bash
# Start both apps in parallel
npm run dev

# Start individual apps
npm run dev:web
npm run dev:api
```

### Building

```bash
# Build all apps
npm run build

# Build individual apps
npm run build:web
npm run build:api
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for specific app
npm run test:web
npm run test:api

# Watch mode (frontend)
cd apps/web && npm run test:watch

# E2E tests (frontend)
cd apps/web && npm run test:e2e
```

### Linting

```bash
# Lint all apps
npm run lint

# Lint specific app
cd apps/web && npm run lint
cd apps/api && npm run lint  # (if configured)
```

## Working with Both Apps

### Making Cross-Stack Changes

When implementing a feature that requires both frontend and backend changes:

1. **Backend First Approach** (Recommended):
```bash
# 1. Start with backend changes
cd apps/api

# 2. Define/update the API endpoint
# Edit: app/routers/your_router.py

# 3. Update schemas if needed
# Edit: app/schemas/your_schema.py

# 4. Write backend tests
# Edit: tests/test_your_feature.py

# 5. Run backend tests
pytest

# 6. Test manually with Swagger UI
# Visit: http://127.0.0.1:8000/docs

# 7. Move to frontend
cd ../web

# 8. Update API client
# Edit: src/lib/api/your-feature.ts

# 9. Create/update components
# Edit: src/components/YourComponent.tsx

# 10. Write frontend tests
# Edit: src/components/__tests__/YourComponent.test.tsx

# 11. Run frontend tests
npm run test
```

2. **Frontend First Approach** (for UI prototyping):
```bash
# 1. Design UI components with mock data
cd apps/web

# 2. Build components and interfaces
# Edit: src/components/YourComponent.tsx
# Edit: src/types/your-types.ts

# 3. Define expected API shape
# Edit: src/lib/api/your-feature.ts (with mock responses)

# 4. Once UI is approved, implement backend
cd ../api

# 5. Implement endpoints matching the frontend contract
# Edit: app/routers/your_router.py
```

### API Contract Synchronization

Keep frontend types and backend schemas in sync:

**Backend (apps/api/app/schemas/project.py)**:
```python
from pydantic import BaseModel

class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    url: str | None = None
```

**Frontend (apps/web/src/types/project.ts)**:
```typescript
export interface ProjectCreate {
  title: string;
  description?: string | null;
  url?: string | null;
}
```

See [INTEGRATION.md](./INTEGRATION.md) for detailed API contracts.

## Database Workflows

### Creating a New Migration

```bash
cd apps/api
source .venv/bin/activate

# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add new column to projects table"

# Or create empty migration
alembic revision -m "Custom migration description"

# Edit the generated migration file
# Location: apps/api/alembic/versions/xxxx_your_migration.py

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Working with Database

```bash
# Access PostgreSQL shell
docker exec -it portfolio-db psql -U postgres -d portfolio_db

# Common queries
\dt              # List tables
\d users         # Describe table structure
SELECT * FROM users LIMIT 5;

# Reset database (CAUTION: destroys data)
alembic downgrade base
alembic upgrade head
PYTHONPATH=. python scripts/seed_admin.py
```

### Database Seeding

```bash
cd apps/api
source .venv/bin/activate

# Seed admin users (Admin, Editor, Viewer)
PYTHONPATH=. python scripts/seed_admin.py

# Create custom seed script
# Create: scripts/seed_custom_data.py
```

## Testing Workflows

### Backend Testing

```bash
cd apps/api
source .venv/bin/activate

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_login_success

# Run with coverage
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Frontend Testing

```bash
cd apps/web

# Unit tests (Vitest)
npm run test

# Watch mode
npm run test:watch

# Run specific test file
npm run test src/components/LoginForm.test.tsx

# UI mode (interactive)
npm run test:ui

# Coverage
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### Integration Testing

Test the full stack together:

```bash
# Terminal 1: Start backend
npm run dev:api

# Terminal 2: Start frontend
npm run dev:web

# Terminal 3: Run E2E tests
cd apps/web
npm run test:e2e
```

## Debugging Tips

### Backend Debugging

1. **Use FastAPI Interactive Docs**:
   - Visit http://127.0.0.1:8000/docs
   - Test endpoints directly with Swagger UI

2. **Print Debugging**:
```python
# Add print statements or use logger
import logging
logger = logging.getLogger(__name__)

logger.info(f"User data: {user}")
```

3. **Python Debugger**:
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use breakpoint() in Python 3.7+
breakpoint()
```

4. **Check Database State**:
```bash
docker exec -it portfolio-db psql -U postgres -d portfolio_db
SELECT * FROM users;
```

### Frontend Debugging

1. **React DevTools**:
   - Install browser extension
   - Inspect component state and props

2. **Network Tab**:
   - Check API requests/responses
   - Verify headers (Authorization token)

3. **Console Logging**:
```typescript
console.log('User data:', user);
console.table(projects); // Nice table format
```

4. **VS Code Debugger**:
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Common Tasks

### Adding a New API Endpoint

```bash
# 1. Create/update router
cd apps/api/app/routers
# Edit or create router file

# 2. Define schemas
cd ../schemas
# Edit or create schema file

# 3. Register router in main.py
# Edit: apps/api/app/main.py

# 4. Write tests
cd ../../tests
# Create test file

# 5. Test manually
# Visit http://127.0.0.1:8000/docs
```

### Adding a New Frontend Page

```bash
cd apps/web

# 1. Create page file
# Create: src/app/[locale]/your-page/page.tsx

# 2. Add translations
# Edit: messages/en.json
# Edit: messages/ja.json

# 3. Create components
# Create: src/components/YourPageComponent.tsx

# 4. Add navigation link
# Edit: src/components/Navigation.tsx (or wherever nav is)

# 5. Test
npm run dev
# Visit http://localhost:3000/en/your-page
```

### Adding a New Database Model

```bash
cd apps/api

# 1. Create model
# Edit: app/models/your_model.py

# 2. Import in __init__.py
# Edit: app/models/__init__.py

# 3. Create schemas
# Edit: app/schemas/your_schema.py

# 4. Generate migration
alembic revision --autogenerate -m "Add YourModel table"

# 5. Review and apply migration
alembic upgrade head

# 6. Create router/endpoints
# Edit: app/routers/your_router.py

# 7. Register router
# Edit: app/main.py
```

### Updating Dependencies

```bash
# Frontend
cd apps/web
npm update
npm audit fix  # Fix security vulnerabilities

# Backend
cd apps/api
pip list --outdated
pip install -U package-name
pip freeze > requirements.txt

# Update root package.json if needed
cd ../..
npm update
```

## Development Best Practices

1. **Keep PRs Small**: Focus on one feature or fix per PR
2. **Write Tests**: Add tests for new features and bug fixes
3. **Update Documentation**: Keep docs in sync with code changes
4. **Use Type Safety**: Leverage TypeScript and Pydantic
5. **Review Before Committing**: Run tests and linting locally
6. **Meaningful Commits**: Follow [commit message guidelines](./CONTRIBUTING.md#commit-message-guidelines)
7. **Sync Types**: Keep frontend types aligned with backend schemas

## Environment-Specific Workflows

### Development
- Use hot reload for both apps
- Enable verbose logging
- Use test database
- Mock external services

### Staging/Testing
- Build optimized bundles
- Use staging database
- Enable error tracking
- Test migrations

### Production
- Optimize builds
- Minimize logging
- Use production database
- Enable monitoring

## Related Documentation

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Integration Guide](./INTEGRATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Frontend Development](../apps/web/docs/development.md)
- [Backend Development](../apps/api/docs/development.md)
