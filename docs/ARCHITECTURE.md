# System Architecture

This document provides a high-level overview of the Portfolio Platform's architecture, showing how the frontend, backend, and database interact.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Breakdown](#component-breakdown)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Technology Stack](#technology-stack)

## System Overview

Portfolio Platform is a full-stack application built as a monorepo with two main applications:

- **Frontend (apps/web)**: Next.js 14 application providing the user interface
- **Backend (apps/api)**: FastAPI application providing REST API and business logic
- **Database**: PostgreSQL for persistent data storage

The architecture follows a classic three-tier pattern:
1. **Presentation Layer**: Next.js frontend (React components, routing, i18n)
2. **Application Layer**: FastAPI backend (business logic, authentication, authorization)
3. **Data Layer**: PostgreSQL database (data persistence, relationships)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Browser                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (Port 3000)                   │ │
│  │                                                             │ │
│  │  - React 18 Components                                      │ │
│  │  - App Router (Next.js 14)                                  │ │
│  │  - Tailwind CSS + shadcn/ui                                 │ │
│  │  - i18n (next-intl)                                         │ │
│  │  - Client-side routing                                      │ │
│  │  - JWT token management                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS (REST API)
                               │ JSON payloads
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Port 8000)                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     API Layer                               │ │
│  │  - RESTful endpoints                                        │ │
│  │  - Request validation (Pydantic)                            │ │
│  │  - CORS middleware                                          │ │
│  │  - Rate limiting                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Authentication Layer                       │ │
│  │  - JWT generation/validation                                │ │
│  │  - Token refresh logic                                      │ │
│  │  - Password hashing (Argon2)                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Authorization Layer                        │ │
│  │  - Role-based access control (RBAC)                         │ │
│  │  - Permission checking                                      │ │
│  │  - Organization isolation                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Business Logic Layer                      │ │
│  │  - User management                                          │ │
│  │  - Project CRUD operations                                  │ │
│  │  - Organization management                                  │ │
│  │  - Audit logging                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Data Access Layer                       │ │
│  │  - SQLAlchemy ORM                                           │ │
│  │  - Database session management                              │ │
│  │  - Query optimization                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ SQL queries
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database (Port 5432)                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Database Schema                        │ │
│  │                                                             │ │
│  │  Tables:                                                    │ │
│  │  - users                    (authentication)                │ │
│  │  - organizations            (multi-tenancy)                 │ │
│  │  - projects                 (core data)                     │ │
│  │  - tags                     (categorization)                │ │
│  │  - project_tags             (many-to-many)                  │ │
│  │  - audit_logs               (activity tracking)             │ │
│  │  - refresh_tokens           (session management)            │ │
│  │  - alembic_version          (migrations)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (apps/web)

**Key Directories**:
```
apps/web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── [locale]/    # Internationalized routes
│   │   └── api/         # API route handlers (if any)
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...          # Feature components
│   ├── lib/             # Utilities and helpers
│   │   ├── api/         # API client functions
│   │   ├── auth/        # Authentication utilities
│   │   └── ...
│   └── types/           # TypeScript type definitions
├── messages/            # i18n translation files
└── public/             # Static assets
```

**Responsibilities**:
- User interface rendering
- Client-side routing and navigation
- Form handling and validation
- JWT token storage and management
- API communication
- Internationalization (English/Japanese)
- Client-side state management

### Backend (apps/api)

**Key Directories**:
```
apps/api/
├── app/
│   ├── main.py           # FastAPI application entry
│   ├── config.py         # Configuration management
│   ├── database.py       # Database connection
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic
│   ├── dependencies/     # Dependency injection
│   └── utils/           # Utility functions
├── alembic/             # Database migrations
├── scripts/             # Utility scripts
└── tests/              # Test suite
```

**Responsibilities**:
- API endpoint implementation
- Business logic execution
- Authentication and authorization
- Database operations
- Data validation
- CORS and security
- Audit logging

### Database (PostgreSQL)

**Core Tables**:

- **users**: User accounts with hashed passwords and roles
- **organizations**: Multi-tenant organization data
- **projects**: Portfolio projects with metadata
- **tags**: Project categorization tags
- **project_tags**: Many-to-many relationship
- **audit_logs**: Activity and change tracking
- **refresh_tokens**: JWT refresh token storage

**Relationships**:
- Users belong to Organizations (many-to-one)
- Projects belong to Organizations (many-to-one)
- Projects have many Tags (many-to-many via project_tags)
- Audit logs reference Users (many-to-one)

## Data Flow

### User Authentication Flow

```
1. User submits login credentials
   ├─> Frontend: Capture form data
   └─> POST /api/auth/login

2. Backend validates credentials
   ├─> Check user exists
   ├─> Verify password (Argon2)
   ├─> Generate access token (30 min expiry)
   ├─> Generate refresh token (7 day expiry)
   └─> Store refresh token in database

3. Frontend receives tokens
   ├─> Store access token (memory/state)
   ├─> Store refresh token (httpOnly cookie or secure storage)
   └─> Redirect to dashboard

4. Subsequent requests
   ├─> Include access token in Authorization header
   └─> Backend validates JWT signature and expiry

5. Token refresh (when access token expires)
   ├─> POST /api/auth/refresh with refresh token
   ├─> Backend validates refresh token
   ├─> Issue new access token
   └─> Continue session
```

### Project CRUD Flow

```
1. User requests project list
   ├─> GET /api/projects
   ├─> Backend checks user permissions
   ├─> Filter by user's organization
   ├─> Query database via SQLAlchemy
   └─> Return JSON array

2. User creates new project
   ├─> Frontend: Display form
   ├─> User submits data
   ├─> POST /api/projects with JSON payload
   ├─> Backend validates schema (Pydantic)
   ├─> Check user has 'create' permission
   ├─> Insert into database
   ├─> Log audit entry
   └─> Return created project

3. User updates project
   ├─> PUT /api/projects/{id}
   ├─> Backend checks ownership/permissions
   ├─> Validate changes
   ├─> Update database record
   ├─> Log audit entry
   └─> Return updated project

4. User deletes project
   ├─> DELETE /api/projects/{id}
   ├─> Backend checks delete permission
   ├─> Soft delete or hard delete
   ├─> Log audit entry
   └─> Return success response
```

## Security Architecture

### Authentication

- **Method**: JWT (JSON Web Tokens)
- **Access Token**: Short-lived (30 minutes), stored in memory
- **Refresh Token**: Long-lived (7 days), stored securely, can be revoked
- **Password Hashing**: Argon2 (industry standard, memory-hard)

### Authorization

- **RBAC (Role-Based Access Control)**:
  - **Admin**: Full system access
  - **Editor**: Create, read, update projects
  - **Viewer**: Read-only access

- **Multi-tenancy**: Organization-level data isolation

### Security Measures

- CORS configuration (whitelist allowed origins)
- HTTPS enforcement in production
- SQL injection prevention (ORM parameterized queries)
- XSS prevention (React escapes by default)
- CSRF protection (token-based)
- Rate limiting on API endpoints
- Input validation (Pydantic schemas)
- Audit logging for sensitive actions

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Internationalization**: next-intl
- **HTTP Client**: Fetch API
- **Testing**: Vitest (unit), Playwright (E2E)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.13
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Authentication**: python-jose (JWT), passlib (Argon2)
- **Testing**: pytest

### Infrastructure
- **Database**: PostgreSQL 14+
- **Package Management**: npm (frontend), pip (backend)
- **Monorepo**: npm workspaces
- **Development**: Turbo (optional build orchestration)

## Scalability Considerations

### Current Architecture
- Suitable for small to medium deployments
- Vertical scaling (more powerful servers)
- Database connection pooling via SQLAlchemy

### Future Enhancements
- Horizontal scaling with load balancer
- Database read replicas for read-heavy workloads
- Redis for caching and session storage
- Message queue for async tasks (Celery + Redis/RabbitMQ)
- CDN for static assets
- Microservices separation if needed

## Related Documentation

- [Integration Guide](./INTEGRATION.md) - API contracts and frontend integration
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Frontend Architecture](../apps/web/docs/architecture.md) - Detailed web app architecture
- [Backend Architecture](../apps/api/docs/architecture.md) - Detailed API architecture
