# Troubleshooting Guide

Common issues and solutions when developing or deploying the Portfolio Platform.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [CORS Issues](#cors-issues)
- [Deployment Issues](#deployment-issues)

## Setup Issues

### npm install fails

**Problem**: Dependencies fail to install

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf apps/web/node_modules apps/web/package-lock.json

# Reinstall
npm install

# If still failing, check Node version
node --version  # Should be 18+
```

### Python virtual environment issues

**Problem**: Cannot activate virtual environment or install packages

**Solutions**:
```bash
# Delete and recreate virtual environment
cd apps/api
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# On Windows, activation is different:
.venv\Scripts\activate
```

### Docker database won't start

**Problem**: PostgreSQL container fails to start

**Solutions**:
```bash
# Check if port 5432 is already in use
lsof -i :5432
# Kill the process if needed
kill -9 <PID>

# Or use a different port in docker-compose.yml
ports:
  - "5433:5432"  # Map to different host port

# Remove existing container and volume
docker-compose down -v
docker-compose up -d

# Check logs
docker-compose logs db
```

## Backend Issues

### Import errors in Python

**Problem**: `ModuleNotFoundError` or import errors

**Solutions**:
```bash
# Ensure virtual environment is activated
source .venv/bin/activate

# Check if package is installed
pip list | grep <package-name>

# Reinstall dependencies
pip install -r requirements.txt

# For local imports, set PYTHONPATH
export PYTHONPATH=.
# Or run scripts with:
PYTHONPATH=. python scripts/your_script.py
```

### Alembic migration errors

**Problem**: Migration fails or database out of sync

**Solutions**:
```bash
# Check current migration version
alembic current

# Check migration history
alembic history

# If database is ahead of migrations
alembic downgrade <previous_version>

# If migrations are ahead of database
alembic upgrade head

# Nuclear option - reset database (DESTROYS DATA)
alembic downgrade base
alembic upgrade head
PYTHONPATH=. python scripts/seed_admin.py

# Check for conflicts in migration files
ls alembic/versions/
# Look for multiple head revisions
```

### uvicorn won't start

**Problem**: Backend server fails to start

**Solutions**:
```bash
# Check if port 8000 is in use
lsof -i :8000
kill -9 <PID>

# Check for syntax errors
cd apps/api
python -m py_compile app/main.py

# Run with verbose logging
uvicorn app.main:app --reload --log-level debug

# Check environment variables
cat .env
# Ensure DATABASE_URL and SECRET_KEY are set
```

### Database connection errors

**Problem**: `sqlalchemy.exc.OperationalError` or connection refused

**Solutions**:
```bash
# Verify database is running
docker ps | grep postgres

# Test connection manually
docker exec -it portfolio-db psql -U postgres -d portfolio_db

# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database
# Example: postgresql://postgres:postgres@localhost:5432/portfolio_db

# Ensure host.docker.internal if running in Docker
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/portfolio_db
```

## Frontend Issues

### Next.js build fails

**Problem**: Build errors or type errors

**Solutions**:
```bash
cd apps/web

# Clear Next.js cache
rm -rf .next

# Check for type errors
npm run type-check

# Build with verbose output
npm run build -- --debug

# If out of memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Page not found (404)

**Problem**: Routes not working correctly

**Solutions**:
```bash
# Check file structure - should follow App Router conventions
apps/web/src/app/[locale]/your-page/page.tsx

# Ensure locale is in middleware
# Check: apps/web/src/middleware.ts

# Clear .next cache
rm -rf .next
npm run dev

# Check for typos in route names
```

### Environment variables not working

**Problem**: `process.env.NEXT_PUBLIC_*` is undefined

**Solutions**:
```bash
# Environment variables must start with NEXT_PUBLIC_ for client-side
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Restart dev server after changing .env files
# Ctrl+C, then npm run dev

# Check if file exists
ls -la apps/web/.env.local

# Variables are embedded at build time for production
npm run build  # Rebuilds with new variables
```

### Hydration errors

**Problem**: React hydration mismatch errors

**Solutions**:
```typescript
// Don't use Date.now() or random values in SSR
// Bad:
<div>{Date.now()}</div>

// Good:
'use client'
const [time, setTime] = useState(null);
useEffect(() => setTime(Date.now()), []);

// Ensure server and client render the same HTML initially
```

## Database Issues

### Cannot connect to database

**Problem**: Connection refused or timeout

**Solutions**:
```bash
# Check if PostgreSQL is running
docker ps

# Start database
docker-compose up -d

# Check connection from host
psql -h localhost -p 5432 -U postgres -d portfolio_db

# If password authentication fails
# Check docker-compose.yml POSTGRES_PASSWORD matches .env
```

### Database migration conflicts

**Problem**: Multiple heads or merge conflicts in migrations

**Solutions**:
```bash
# List all migrations
alembic history

# If multiple heads exist
alembic merge <head1> <head2> -m "merge heads"

# Apply the merge migration
alembic upgrade head

# Alternatively, downgrade and reapply
alembic downgrade base
alembic upgrade head
```

### Data seeding fails

**Problem**: Seed script errors

**Solutions**:
```bash
# Ensure database is empty or users don't exist
# Check for existing admin user
docker exec -it portfolio-db psql -U postgres -d portfolio_db
SELECT * FROM users WHERE email = 'admin@example.com';

# If user exists, either:
# 1. Skip seeding
# 2. Delete existing users
DELETE FROM users;

# Or modify seed script to check existence first
```

## Authentication Issues

### Login returns 401 Unauthorized

**Problem**: Valid credentials rejected

**Solutions**:
```bash
# Check user exists in database
docker exec -it portfolio-db psql -U postgres -d portfolio_db
SELECT email, hashed_password FROM users WHERE email = 'admin@example.com';

# Verify password hashing
# In Python:
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
pwd_context.verify("admin12345", "<hashed_password_from_db>")

# Reseed admin users
cd apps/api
PYTHONPATH=. python scripts/seed_admin.py
```

### Token expired or invalid

**Problem**: 401 error on protected endpoints

**Solutions**:
```javascript
// Check token in browser DevTools
localStorage.getItem('access_token')

// Verify token hasn't expired (tokens are valid for 30 minutes)
// Check timestamp of last login

// Implement token refresh
// Should automatically refresh when access token expires

// Check SECRET_KEY matches between environments
// Backend .env SECRET_KEY must be consistent
```

### CORS blocking authentication

**Problem**: Cookies not being set or sent

**Solutions**:
```javascript
// Frontend - ensure credentials included
fetch(url, {
  credentials: 'include',
  // ...
});

// Backend - ensure CORS allows credentials
# apps/api/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,  # Must be True
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

// Check browser DevTools > Network > Headers
// Verify 'Set-Cookie' in response headers
```

## CORS Issues

### Blocked by CORS policy

**Problem**: Browser blocks API requests

**Solutions**:
```python
# Backend - apps/api/app/main.py
# Ensure frontend origin is in allowed origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For development, you can temporarily allow all (NOT for production)
allow_origins=["*"]
```

### Preflight requests failing

**Problem**: OPTIONS requests return errors

**Solutions**:
```python
# Ensure CORS middleware is added before routes
# Order matters!

# In main.py, add middleware BEFORE including routers
app.add_middleware(CORSMiddleware, ...)
app.include_router(auth_router)

# Check that OPTIONS method is allowed
allow_methods=["*"]  # or ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
```

## Deployment Issues

### Environment variables not set

**Problem**: App crashes due to missing configuration

**Solutions**:
```bash
# Check which variables are required
# See: docs/ENVIRONMENT.md

# Verify variables are set in deployment platform
# - Vercel: Project Settings > Environment Variables
# - Railway: Variables tab
# - Docker: .env file or docker-compose.yml

# Use placeholder values for optional variables
OPTIONAL_VAR=${OPTIONAL_VAR:-default_value}
```

### Database migrations not running

**Problem**: Production database schema outdated

**Solutions**:
```bash
# SSH into server or use platform CLI
cd apps/api
source .venv/bin/activate
alembic upgrade head

# For Docker deployments, add to entrypoint
# Dockerfile
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0

# For platform deployments (Heroku, Railway), add release command
# Procfile
release: cd apps/api && alembic upgrade head
web: cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Build fails in CI/CD

**Problem**: GitHub Actions or deployment pipeline fails

**Solutions**:
```yaml
# Check Node and Python versions match
# .github/workflows/ci.yml
- uses: actions/setup-node@v3
  with:
    node-version: '18'

- uses: actions/setup-python@v4
  with:
    python-version: '3.13'

# Ensure environment variables are set in CI
# GitHub: Settings > Secrets and variables > Actions

# Check build logs for specific errors
# Common: missing dependencies, type errors, test failures
```

### Static files not loading

**Problem**: CSS, JS, or images 404 in production

**Solutions**:
```javascript
// Next.js - ensure proper configuration
// next.config.js
module.exports = {
  output: 'standalone',  // For Docker
  // or
  // For static export (if using)
  output: 'export',
}

// Check public folder structure
apps/web/public/
  favicon.ico
  images/

// Access in code
<Image src="/images/logo.png" />
```

## Performance Issues

### Slow API responses

**Problem**: API endpoints taking too long

**Solutions**:
```python
# Add database indexes
# apps/api/alembic/versions/xxx_add_indexes.py
op.create_index('idx_projects_org_id', 'projects', ['organization_id'])

# Use select/load strategies to avoid N+1 queries
from sqlalchemy.orm import selectinload

projects = db.query(Project).options(
    selectinload(Project.tags)
).all()

# Add caching for frequently accessed data
# Consider Redis or in-memory caching

# Profile slow queries
import time
start = time.time()
# ... query ...
print(f"Query took {time.time() - start}s")
```

### Frontend performance issues

**Problem**: Slow page loads or rendering

**Solutions**:
```typescript
// Use React.memo for expensive components
const MemoizedComponent = React.memo(ExpensiveComponent);

// Lazy load components
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});

// Optimize images
import Image from 'next/image';
<Image src="/photo.jpg" width={500} height={300} />

// Check bundle size
npm run build
# Look for large chunks

// Use production build for testing
npm run build && npm start
```

## Getting More Help

If you're still stuck:

1. **Check Logs**:
   - Backend: `docker-compose logs api`
   - Frontend: Browser console
   - Database: `docker-compose logs db`

2. **Enable Debug Mode**:
   ```bash
   # Backend
   uvicorn app.main:app --reload --log-level debug

   # Frontend
   # Check browser DevTools > Console
   ```

3. **Search Documentation**:
   - [Development Guide](./DEVELOPMENT.md)
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Integration Guide](./INTEGRATION.md)

4. **Check Interactive API Docs**:
   - Visit http://127.0.0.1:8000/docs
   - Test endpoints directly

5. **Create an Issue**:
   - Include error messages
   - Steps to reproduce
   - Environment details (OS, versions, etc.)
