# Frontend-Backend Integration Guide

This document details how the Next.js frontend and FastAPI backend integrate, including API contracts, authentication flow, and data synchronization.

## Table of Contents

- [API Overview](#api-overview)
- [Authentication Integration](#authentication-integration)
- [API Contracts](#api-contracts)
- [Type Synchronization](#type-synchronization)
- [Error Handling](#error-handling)
- [CORS Configuration](#cors-configuration)
- [Best Practices](#best-practices)

## API Overview

### Base URLs

- **Development Frontend**: http://localhost:3000
- **Development Backend**: http://127.0.0.1:8000
- **Production**: Configure via environment variables

### API Structure

```
/api
├── /auth           # Authentication endpoints
│   ├── POST /login
│   ├── POST /register
│   ├── POST /refresh
│   └── POST /logout
├── /users          # User management
│   ├── GET /me
│   ├── PUT /me
│   └── GET /{id}
├── /projects       # Project CRUD
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── /organizations  # Organization management
│   ├── GET /
│   ├── POST /
│   └── GET /{id}
└── /tags           # Tag management
    ├── GET /
    ├── POST /
    └── DELETE /{id}
```

Full API documentation available at: http://127.0.0.1:8000/docs

## Authentication Integration

### Authentication Flow

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│ Browser │                 │ Next.js │                │ FastAPI  │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │ 1. User submits login     │                          │
     │─────────────────────────>│                          │
     │                           │                          │
     │                           │ 2. POST /api/auth/login  │
     │                           │────────────────────────>│
     │                           │                          │
     │                           │ 3. Validate credentials  │
     │                           │                          │
     │                           │ 4. Return tokens         │
     │                           │<────────────────────────│
     │                           │ {                        │
     │                           │   access_token,          │
     │                           │   refresh_token          │
     │                           │ }                        │
     │                           │                          │
     │ 5. Store tokens           │                          │
     │<─────────────────────────│                          │
     │                           │                          │
     │ 6. Subsequent requests    │                          │
     │─────────────────────────>│                          │
     │                           │ Authorization: Bearer    │
     │                           │────────────────────────>│
     │                           │                          │
     │                           │ 7. Validate JWT          │
     │                           │                          │
     │                           │ 8. Return data           │
     │                           │<────────────────────────│
     │                           │                          │
```

### Frontend Authentication Implementation

**Token Storage** (apps/web/src/lib/auth/auth-store.ts):
```typescript
// Store access token in memory
let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Refresh token stored in httpOnly cookie (set by backend)
```

**API Client** (apps/web/src/lib/api/client.ts):
```typescript
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for refresh token
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh token
      await refreshAccessToken();
      // Retry request
      return apiClient(endpoint, options);
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

**Login Function** (apps/web/src/lib/api/auth.ts):
```typescript
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  setAccessToken(data.access_token);
  return data;
}
```

### Backend Authentication Implementation

**Token Generation** (apps/api/app/routers/auth.py):
```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Validate user credentials
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    # Store refresh token in database
    store_refresh_token(db, user.id, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

**Protected Endpoints**:
```python
from app.dependencies.auth import get_current_user

@router.get("/projects")
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # User is authenticated, filter by organization
    projects = db.query(Project).filter(
        Project.organization_id == current_user.organization_id
    ).all()
    return projects
```

## API Contracts

### Authentication Endpoints

#### POST /api/auth/login

**Request**:
```typescript
// Content-Type: application/x-www-form-urlencoded
{
  username: string;  // email
  password: string;
}
```

**Response**:
```typescript
{
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}
```

#### POST /api/auth/refresh

**Request**:
```typescript
// Refresh token sent via httpOnly cookie or body
{
  refresh_token?: string;
}
```

**Response**:
```typescript
{
  access_token: string;
  token_type: "bearer";
}
```

### Project Endpoints

#### GET /api/projects

**Request**:
```typescript
// Headers
Authorization: Bearer <access_token>

// Query params (optional)
?skip=0&limit=100
```

**Response**:
```typescript
Array<{
  id: number;
  title: string;
  description: string | null;
  url: string | null;
  github_url: string | null;
  demo_url: string | null;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
  organization_id: number;
  tags: Array<{
    id: number;
    name: string;
  }>;
}>
```

#### POST /api/projects

**Request**:
```typescript
// Headers
Authorization: Bearer <access_token>
Content-Type: application/json

// Body
{
  title: string;
  description?: string | null;
  url?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  tag_ids?: number[];
}
```

**Response**:
```typescript
{
  id: number;
  title: string;
  description: string | null;
  url: string | null;
  github_url: string | null;
  demo_url: string | null;
  created_at: string;
  updated_at: string;
  organization_id: number;
  tags: Array<{ id: number; name: string; }>;
}
```

#### PUT /api/projects/{id}

**Request**:
```typescript
// Headers
Authorization: Bearer <access_token>
Content-Type: application/json

// Body (all fields optional)
{
  title?: string;
  description?: string | null;
  url?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  tag_ids?: number[];
}
```

**Response**: Same as POST response

#### DELETE /api/projects/{id}

**Request**:
```typescript
// Headers
Authorization: Bearer <access_token>
```

**Response**:
```typescript
{
  message: "Project deleted successfully"
}
```

### User Endpoints

#### GET /api/users/me

**Request**:
```typescript
// Headers
Authorization: Bearer <access_token>
```

**Response**:
```typescript
{
  id: number;
  email: string;
  full_name: string | null;
  role: "admin" | "editor" | "viewer";
  organization_id: number;
  is_active: boolean;
  created_at: string;
}
```

## Type Synchronization

### Keeping Types in Sync

**Backend Schema** (apps/api/app/schemas/project.py):
```python
from pydantic import BaseModel
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str | None = None
    url: str | None = None
    github_url: str | None = None
    demo_url: str | None = None

class ProjectCreate(ProjectBase):
    tag_ids: list[int] = []

class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    url: str | None = None
    github_url: str | None = None
    demo_url: str | None = None
    tag_ids: list[int] | None = None

class ProjectResponse(ProjectBase):
    id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime
    tags: list[TagResponse] = []

    class Config:
        from_attributes = True
```

**Frontend Types** (apps/web/src/types/project.ts):
```typescript
export interface ProjectBase {
  title: string;
  description?: string | null;
  url?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
}

export interface ProjectCreate extends ProjectBase {
  tag_ids?: number[];
}

export interface ProjectUpdate {
  title?: string;
  description?: string | null;
  url?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  tag_ids?: number[];
}

export interface Project extends ProjectBase {
  id: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}
```

### Type Generation (Future Enhancement)

Consider using tools like:
- **openapi-typescript**: Generate TS types from OpenAPI spec
- **pydantic-to-typescript**: Convert Pydantic models to TypeScript

## Error Handling

### Backend Error Responses

**Validation Error (422)**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Authentication Error (401)**:
```json
{
  "detail": "Could not validate credentials"
}
```

**Permission Error (403)**:
```json
{
  "detail": "Not enough permissions"
}
```

**Not Found (404)**:
```json
{
  "detail": "Project not found"
}
```

### Frontend Error Handling

```typescript
try {
  const project = await createProject(data);
  // Success handling
} catch (error) {
  if (error.status === 422) {
    // Validation error - show field errors
    displayValidationErrors(error.detail);
  } else if (error.status === 401) {
    // Unauthorized - redirect to login
    redirectToLogin();
  } else if (error.status === 403) {
    // Forbidden - show permission error
    showPermissionError();
  } else {
    // Generic error
    showGenericError();
  }
}
```

## CORS Configuration

### Backend CORS Setup

**apps/api/app/main.py**:
```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Fetch Configuration

```typescript
fetch(url, {
  credentials: 'include',  // Send cookies
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});
```

## Best Practices

### 1. API Versioning

Consider versioning your API:
```python
# apps/api/app/main.py
app.include_router(auth_router, prefix="/api/v1")
```

### 2. Request/Response Logging

Log API interactions for debugging:
```typescript
// Frontend
console.log('API Request:', { endpoint, method, data });
console.log('API Response:', response);
```

### 3. Loading States

Handle loading states in UI:
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await createProject(data);
  } finally {
    setLoading(false);
  }
};
```

### 4. Optimistic Updates

Update UI before API response for better UX:
```typescript
// Add to local state immediately
setProjects([...projects, newProject]);

// Then sync with backend
try {
  await createProject(newProject);
} catch (error) {
  // Rollback on error
  setProjects(projects);
}
```

### 5. Data Validation

Validate on both sides:
- **Backend**: Pydantic schemas (authoritative)
- **Frontend**: Form validation libraries (UX)

### 6. Pagination

Implement pagination for large datasets:
```typescript
// Frontend
const { data, hasMore } = await getProjects({ skip: 0, limit: 20 });

// Backend
@router.get("/projects")
async def get_projects(skip: int = 0, limit: int = 100):
    ...
```

### 7. Caching

Cache API responses when appropriate:
```typescript
// Use React Query, SWR, or similar
const { data, error } = useSWR('/api/projects', fetcher);
```

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Development Workflow](./DEVELOPMENT.md)
- [API Documentation](../apps/api/docs/api-endpoints.md)
- [Frontend API Client](../apps/web/docs/development.md)
