# Architecture & Design Decisions

## Framework Choice

**Next.js 14 (App Router)** was chosen because:
- Modern React patterns with Server and Client Components
- Built-in routing and file-based conventions
- Excellent TypeScript support
- Performance optimizations out of the box
- Large community and ecosystem

---

## Application Structure

The application follows **Next.js App Router conventions**:

### Directory Structure

- `app/[locale]/`
  Locale-based routing for internationalization. All pages are nested under locale segments (`/en/*`, `/ja/*`).

- `app/[locale]/login/`
  Login page with form handling and authentication.

- `app/[locale]/projects/`
  Projects management with CRUD operations.

- `app/[locale]/tags/`
  Tag management interface.

- `app/[locale]/users/`
  User management (admin only).

- `app/[locale]/activity/`
  Audit log viewing (admin only).

- `components/`
  Reusable UI components (navigation, UI primitives).

- `lib/`
  Utility libraries for API calls and authentication.

- `messages/`
  Translation files for English and Japanese.

- `i18n/`
  i18n configuration (locale settings, request handler).

- `e2e/`
  End-to-end tests using Playwright.

- `tests/`
  Unit tests using Vitest.

---

## Key Design Patterns

### Client Components for Interactive UI

All pages requiring authentication are Client Components (`"use client"`):
- Enable React hooks (useState, useEffect)
- Access localStorage for auth tokens
- Handle user interactions and form submissions

### Centralized API Client

`lib/api.ts` provides a centralized API client with:
- Automatic JWT token injection
- Token refresh on 401 errors
- Type-safe request/response handling
- Error handling and retry logic

### Event-Based Auth State Sync

Authentication state changes emit custom events (`pp-auth-changed`):
- Components listen for auth changes
- Automatic redirect to login on session expiry
- No prop drilling or context complexity

### Locale-Based Routing

next-intl handles internationalization:
- Routes prefixed with locale (`/en/*`, `/ja/*`)
- Server and client component support
- Type-safe translation keys

---

## Authentication Flow

1. **User logs in** via `/[locale]/login`
2. **Backend returns** access token + refresh token
3. **Frontend stores** tokens in localStorage
4. **All API requests** include access token in Authorization header
5. **On 401 error**:
   - Attempt to refresh token
   - Retry original request
   - On refresh failure, clear auth and redirect to login

---

## RBAC Implementation

Role-based access control is enforced on:

### UI Level
- Hide/show UI elements based on user role
- Example: Viewers don't see "Create" buttons

### API Level
- Backend validates permissions on every request
- Frontend trusts backend responses

### Routing Level
- Admin-only pages redirect non-admins to `/projects`
- Unauthenticated users redirect to `/login`

---

## State Management

**No global state library** is used. Instead:
- Component-local state with `useState`
- Auth state in `localStorage` + event sync
- Server state managed per-component

This keeps the application simple and avoids over-engineering.

---

## Styling Approach

**Tailwind CSS** with **shadcn/ui** components:
- Utility-first CSS for rapid development
- shadcn/ui provides accessible, composable components
- Built on Radix UI primitives for accessibility
- Uses `cn()` utility (clsx + tailwind-merge) for className merging
- No CSS modules or styled-components
- Responsive by default

---

## Testing Strategy

### Unit Tests (Vitest)
- Test utility functions (auth, API client)
- Test component rendering logic
- Fast, isolated tests

### E2E Tests (Playwright)
- Test critical user flows (login, CRUD operations)
- Test RBAC enforcement
- Test token refresh behavior
- Run in CI on every push

---

## Why These Choices Matter

- **Next.js App Router**: Modern, performant, industry-standard
- **TypeScript**: Type safety reduces bugs
- **Tailwind CSS**: Fast development, consistent design
- **Playwright**: Reliable E2E testing
- **next-intl**: Mature i18n solution

These choices reflect **professional frontend development practices**.
