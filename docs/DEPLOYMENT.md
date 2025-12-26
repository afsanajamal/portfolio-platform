# Deployment Guide

This guide covers deploying the Portfolio Platform to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Manual Deployment](#manual-deployment)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.13+ (for backend)
- PostgreSQL 14+ (production database)
- Domain name with DNS configured
- SSL/TLS certificate

## Environment Configuration

### Production Environment Variables

Create production environment files:

**Frontend (`apps/web/.env.production`)**:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

**Backend (`apps/api/.env`)**:
```env
DATABASE_URL=postgresql://user:password@db-host:5432/portfolio_db
SECRET_KEY=your-secure-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for complete variable documentation.

## Database Setup

### 1. Create Production Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE portfolio_db;

-- Create user with password
CREATE USER portfolio_user WITH PASSWORD 'secure-password-here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
```

### 2. Run Migrations

```bash
cd apps/api
source .venv/bin/activate
alembic upgrade head
```

### 3. Seed Initial Admin User

```bash
PYTHONPATH=. python scripts/seed_admin.py
```

## Deployment Options

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Create production docker-compose.yml**:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: portfolio_db
      POSTGRES_USER: portfolio_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://portfolio_user:${DB_PASSWORD}@db:5432/portfolio_db
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - db
    networks:
      - app-network
    restart: unless-stopped

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - api
    ports:
      - "3000:3000"
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
      - api
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

2. **Create Dockerfiles**:

**Backend Dockerfile** (`apps/api/Dockerfile`):
```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile** (`apps/web/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

3. **Deploy**:

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

#### Backend Deployment

1. **Install dependencies**:
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. **Run migrations**:
```bash
alembic upgrade head
```

3. **Start with production server**:
```bash
# Using gunicorn with uvicorn workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

4. **Setup systemd service** (optional):

Create `/etc/systemd/system/portfolio-api.service`:
```ini
[Unit]
Description=Portfolio Platform API
After=network.target postgresql.service

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/portfolio-platform/apps/api
Environment="PATH=/var/www/portfolio-platform/apps/api/.venv/bin"
ExecStart=/var/www/portfolio-platform/apps/api/.venv/bin/gunicorn \
  app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable portfolio-api
sudo systemctl start portfolio-api
```

#### Frontend Deployment

1. **Build the application**:
```bash
cd apps/web
npm ci
npm run build
```

2. **Start the production server**:
```bash
npm start
```

3. **Setup systemd service** (optional):

Create `/etc/systemd/system/portfolio-web.service`:
```ini
[Unit]
Description=Portfolio Platform Web
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/portfolio-platform/apps/web
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

### Cloud Platform Deployment

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from root
cd apps/web
vercel --prod
```

Environment variables can be configured in Vercel dashboard.

#### Railway/Render (Backend)

1. Connect your GitHub repository
2. Configure build command: `cd apps/api && pip install -r requirements.txt`
3. Configure start command: `cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in platform dashboard

#### DigitalOcean App Platform

1. Create new app from GitHub repository
2. Configure components:
   - **Web Service** (Frontend): Build command `cd apps/web && npm run build`, Run command `cd apps/web && npm start`
   - **Web Service** (Backend): Build command `cd apps/api && pip install -r requirements.txt`, Run command `cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port 8080`
   - **Database**: PostgreSQL (managed)

## Post-Deployment Tasks

### 1. Verify Deployment

```bash
# Test API health
curl https://api.yourdomain.com/health

# Test frontend
curl https://yourdomain.com
```

### 2. Setup SSL/TLS

Using Let's Encrypt with Certbot:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 3. Configure Nginx Reverse Proxy

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Setup Monitoring

- Configure application logging
- Setup error tracking (e.g., Sentry)
- Configure uptime monitoring
- Setup database backups

## Monitoring and Maintenance

### Database Backups

```bash
# Create backup
pg_dump -U portfolio_user portfolio_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U portfolio_user portfolio_db < backup_20240101.sql
```

### Log Management

```bash
# View API logs
docker-compose logs -f api

# View web logs
docker-compose logs -f web

# View nginx logs
docker-compose logs -f nginx
```

### Health Checks

Setup automated health checks for:
- API endpoint: `GET /health`
- Database connectivity
- Frontend availability
- SSL certificate expiration

### Updates and Migrations

```bash
# Pull latest changes
git pull origin main

# Backend updates
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

# Frontend updates
cd apps/web
npm ci
npm run build

# Restart services
docker-compose restart
# or
sudo systemctl restart portfolio-api portfolio-web
```

## Security Checklist

- [ ] Strong SECRET_KEY configured
- [ ] Database credentials secured
- [ ] CORS origins properly configured
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular security updates applied
- [ ] Database backups automated
- [ ] Rate limiting configured
- [ ] Environment variables secured (not in code)
- [ ] Admin passwords changed from defaults

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common deployment issues and solutions.
