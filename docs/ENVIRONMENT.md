# Environment Variables Reference

Complete reference for all environment variables used across the Portfolio Platform.

## Table of Contents

- [Frontend Variables](#frontend-variables)
- [Backend Variables](#backend-variables)
- [Database Variables](#database-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Security Best Practices](#security-best-practices)

## Frontend Variables

### Location
- Development: `apps/web/.env.local`
- Production: Platform-specific (Vercel, etc.)

### Required Variables

#### NEXT_PUBLIC_API_URL
- **Description**: Backend API base URL
- **Type**: String (URL)
- **Required**: Yes
- **Examples**:
  - Development: `http://127.0.0.1:8000`
  - Production: `https://api.yourdomain.com`
- **Notes**: Must start with `NEXT_PUBLIC_` to be accessible in browser

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Optional Variables

#### NEXT_PUBLIC_APP_URL
- **Description**: Frontend application URL (for redirects, meta tags)
- **Type**: String (URL)
- **Required**: No
- **Default**: Inferred from request
- **Examples**:
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### NODE_ENV
- **Description**: Application environment
- **Type**: String
- **Required**: No (automatically set)
- **Values**: `development` | `production` | `test`
- **Notes**: Set automatically by Next.js

```env
NODE_ENV=production
```

### Example .env.local

```env
# apps/web/.env.local

# Required
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Backend Variables

### Location
- All environments: `apps/api/.env`

### Required Variables

#### DATABASE_URL
- **Description**: PostgreSQL database connection string
- **Type**: String (Connection URI)
- **Required**: Yes
- **Format**: `postgresql://user:password@host:port/database`
- **Examples**:
  - Development: `postgresql://postgres:postgres@localhost:5432/portfolio_db`
  - Production: `postgresql://user:secure_pass@db.host:5432/prod_db`
- **Notes**: Can also be split into separate variables (see alternatives)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_db
```

#### SECRET_KEY
- **Description**: Secret key for JWT token signing
- **Type**: String
- **Required**: Yes
- **Min Length**: 32 characters
- **Security**: Must be cryptographically secure random string
- **Generate**:
  ```bash
  # Python
  python -c "import secrets; print(secrets.token_urlsafe(32))"

  # OpenSSL
  openssl rand -base64 32
  ```
- **Notes**: NEVER commit to version control

```env
SECRET_KEY=your-super-secret-key-min-32-chars-long-here
```

#### ALGORITHM
- **Description**: Algorithm for JWT encoding
- **Type**: String
- **Required**: Yes
- **Default**: `HS256`
- **Values**: `HS256` | `HS384` | `HS512`

```env
ALGORITHM=HS256
```

### Optional Variables

#### ACCESS_TOKEN_EXPIRE_MINUTES
- **Description**: Access token expiry time in minutes
- **Type**: Integer
- **Required**: No
- **Default**: `30`
- **Recommended**: 15-60 minutes

```env
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### REFRESH_TOKEN_EXPIRE_DAYS
- **Description**: Refresh token expiry time in days
- **Type**: Integer
- **Required**: No
- **Default**: `7`
- **Recommended**: 7-30 days

```env
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### ENVIRONMENT
- **Description**: Application environment identifier
- **Type**: String
- **Required**: No
- **Default**: `development`
- **Values**: `development` | `staging` | `production`

```env
ENVIRONMENT=production
```

#### CORS_ORIGINS
- **Description**: Allowed CORS origins (comma-separated)
- **Type**: String (comma-separated URLs)
- **Required**: No
- **Default**: `http://localhost:3000`
- **Format**: Comma-separated list
- **Examples**:
  ```env
  CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
  ```

#### LOG_LEVEL
- **Description**: Logging verbosity level
- **Type**: String
- **Required**: No
- **Default**: `INFO`
- **Values**: `DEBUG` | `INFO` | `WARNING` | `ERROR` | `CRITICAL`

```env
LOG_LEVEL=INFO
```

#### SENTRY_DSN
- **Description**: Sentry error tracking DSN (if using Sentry)
- **Type**: String (URL)
- **Required**: No
- **Example**: `https://examplePublicKey@o0.ingest.sentry.io/0`

```env
SENTRY_DSN=https://your-sentry-dsn-here
```

### Example .env (Backend)

```env
# apps/api/.env

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_db

# Security
SECRET_KEY=your-super-secret-key-generated-with-secure-method
ALGORITHM=HS256

# Token Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
ENVIRONMENT=production
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Logging
LOG_LEVEL=INFO

# Optional: Error Tracking
# SENTRY_DSN=https://your-sentry-dsn-here
```

## Database Variables

These variables are typically set in `docker-compose.yml` for local development or in your database service configuration for production.

### POSTGRES_USER
- **Description**: PostgreSQL superuser name
- **Type**: String
- **Default**: `postgres`

### POSTGRES_PASSWORD
- **Description**: PostgreSQL superuser password
- **Type**: String
- **Security**: Use strong password in production

### POSTGRES_DB
- **Description**: Default database name
- **Type**: String
- **Default**: `postgres`

### Example docker-compose.yml

```yaml
services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: portfolio_db
    ports:
      - "5432:5432"
```

## Environment-Specific Configuration

### Development

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env)**:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_db
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=DEBUG
```

### Staging

**Frontend**:
```env
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NODE_ENV=production
```

**Backend**:
```env
DATABASE_URL=postgresql://user:password@staging-db.host:5432/portfolio_staging
SECRET_KEY=staging-secret-key-cryptographically-secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=staging
CORS_ORIGINS=https://staging.yourdomain.com
LOG_LEVEL=INFO
```

### Production

**Frontend**:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

**Backend**:
```env
DATABASE_URL=postgresql://prod_user:strong_password@prod-db.host:5432/portfolio_prod
SECRET_KEY=production-secret-key-very-strong-and-secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=WARNING
SENTRY_DSN=https://your-production-sentry-dsn
```

## Security Best Practices

### 1. Never Commit Secrets
```bash
# Add to .gitignore (already included)
.env
.env.local
.env.*.local
apps/web/.env.local
apps/api/.env
```

### 2. Use Strong SECRET_KEY

```bash
# Generate secure key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Never use weak keys like:
# - "secret"
# - "your-secret-key"
# - "change-me"
```

### 3. Different Secrets Per Environment

- Development: Can be simpler for convenience
- Staging: Should mirror production security
- Production: Must be cryptographically secure

### 4. Rotate Secrets Regularly

- Change SECRET_KEY periodically
- Update database passwords
- Rotate API keys

### 5. Use Environment-Specific Files

```bash
# Development
.env.local           # Local overrides (not committed)
.env.development     # Development defaults (can be committed)

# Production
# Use deployment platform's environment variables
# Don't use .env files in production
```

### 6. Validate Required Variables

**Backend example** (apps/api/app/config.py):
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"

settings = Settings()  # Raises error if required vars missing
```

### 7. Least Privilege Principle

- Use dedicated database user (not `postgres` superuser)
- Grant only necessary permissions
- Limit CORS origins to specific domains

### 8. Audit Environment Variables

Regularly review:
- Which variables are set
- Who has access
- Whether they're still needed
- If values need rotation

## Platform-Specific Configuration

### Vercel (Frontend)

1. Go to Project Settings > Environment Variables
2. Add variables for each environment:
   - Production
   - Preview
   - Development

**Screenshot placeholders**:
- Variable Name: `NEXT_PUBLIC_API_URL`
- Value: `https://api.yourdomain.com`
- Environments: Production

### Railway (Backend)

1. Select your service
2. Go to Variables tab
3. Add variables:
   - `DATABASE_URL` (auto-set if using Railway PostgreSQL)
   - `SECRET_KEY`
   - Others as needed

### Heroku

```bash
# Set variables via CLI
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=postgresql://...

# Or via dashboard: Settings > Config Vars
```

### Docker Compose

```yaml
services:
  api:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    # Or use env_file
    env_file:
      - .env
```

## Checking Current Configuration

### Backend

```python
# apps/api/app/main.py or a debug endpoint
from app.config import settings

@app.get("/debug/config")
async def debug_config():
    return {
        "environment": settings.environment,
        "cors_origins": settings.cors_origins,
        "database": "Connected" if settings.database_url else "Not set",
        # Never expose SECRET_KEY!
    }
```

### Frontend

```typescript
// In browser console
console.log({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  nodeEnv: process.env.NODE_ENV,
});
```

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Using environment variables in deployment
- [Troubleshooting](./TROUBLESHOOTING.md) - Environment-related issues
- [Development Workflow](./DEVELOPMENT.md) - Setting up local environment
