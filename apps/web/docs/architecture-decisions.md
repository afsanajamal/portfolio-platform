# Architecture Decisions

This document captures key architectural and technical decisions made during the development of this project, including the rationale, alternatives considered, and trade-offs.

---

## 1. State Management: React Hooks vs Redux

### Decision: Use React Hooks + localStorage

**Context:**
- Small-to-medium frontend application with 5 main features (auth, projects, tags, users, activity)
- Most state is page-specific and doesn't need to be shared across components
- Authentication state is the primary cross-component concern

**Alternatives Considered:**
- **Redux Toolkit**: Popular global state management with Redux DevTools
- **Zustand**: Lightweight state management library
- **Jotai**: Atomic state management
- **React Context API**: Built-in context for shared state

**Why React Hooks + localStorage:**

1. **Simplicity**:
   - Hooks are built into React (zero external dependencies for state management)
   - Less boilerplate compared to Redux (no store setup, slices, reducers, actions)
   - Easier for new developers to understand

2. **Right-Sized Solution**:
   - Most state is page-specific (projects list, tags list, form state)
   - Limited shared state (auth tokens, user role, org ID)
   - No complex state dependencies or cross-feature interactions

3. **Modern Next.js Best Practice**:
   - Recommended approach for Next.js App Router
   - Aligns with React team's direction (hooks over external state libraries)
   - Used by modern companies like Vercel, Linear, Stripe for similar-sized apps

4. **Performance**:
   - No re-render performance issues with current app size
   - useState updates are local to components
   - No need for memoization/selectors to prevent re-renders

**Implementation Details:**

```typescript
// Auth state in localStorage
localStorage.setItem('pp-access-token', token)
localStorage.setItem('pp-refresh-token', refresh)
localStorage.setItem('pp-user-role', role)

// Cross-component sync with custom events
window.dispatchEvent(new Event('pp-auth-changed'))
window.addEventListener('pp-auth-changed', syncAuthState)
```

**Trade-offs:**

| Aspect | Current (Hooks) | Redux Alternative |
|--------|----------------|-------------------|
| Boilerplate | Minimal | Moderate (store, slices, types) |
| Learning curve | Low (React basics) | Medium (Redux concepts) |
| DevTools | Browser console | Redux DevTools |
| Testing | Simple (React Testing Library) | More setup (mock store) |
| Shared state | Manual (localStorage + events) | Centralized store |
| Time-travel debugging | No | Yes |

**When Would We Use Redux:**

Redux Toolkit would become necessary if:
- 10+ features with complex state interactions
- Multiple components need same data without parent-child relationship
- Need time-travel debugging for complex flows
- Team has strong Redux experience
- Real-time collaborative features (multiple users editing same data)
- Optimistic updates with rollback needed

**Conclusion:**

For this portfolio project, React Hooks provide the right balance of simplicity and functionality. The decision demonstrates understanding of when NOT to over-engineer a solution.

---

## 2. Authentication: JWT with Refresh Tokens

### Decision: Implement JWT-based auth with automatic token refresh

**Why:**
- Industry-standard approach for stateless authentication
- Secure: Access tokens are short-lived (30 min), refresh tokens are long-lived (7 days)
- Automatic refresh prevents user disruption when access token expires
- Stored in localStorage (acceptable for educational project; would use httpOnly cookies in high-security production)

**Implementation:**

```typescript
// Auto-refresh on 401 responses
if (res.status === 401 && retry && options.auth) {
  const refreshed = await refreshOnce()
  setAuth(refreshed.access_token, refreshed.refresh_token, ...)
  return apiFetch(path, { ...options, auth: true }, false)
}
```

**Trade-offs:**
- localStorage is vulnerable to XSS (mitigated by Next.js CSP and no user-generated content)
- For production banking app: would use httpOnly cookies + CSRF tokens

---

## 3. Internationalization: next-intl

### Decision: Use next-intl for English/Japanese support

**Why:**
- Best-in-class i18n library for Next.js App Router
- Type-safe translation keys
- Server and client component support
- Locale-based routing (`/en/*`, `/ja/*`)

**Alternatives:**
- react-i18next (more popular but less Next.js-specific)
- next-translate (older, less maintained)

**Trade-offs:**
- next-intl requires locale in URL path (can't detect from browser automatically)
- Acceptable trade-off for explicit locale selection and SEO benefits

---

## 4. Styling: Tailwind CSS

### Decision: Use Tailwind CSS with shadcn/ui components

**Why:**
- Utility-first approach speeds up development
- Mobile-first responsive design with breakpoints (sm, md, lg)
- No CSS file management or naming conventions needed
- shadcn/ui provides accessible, production-ready components
- Built on Radix UI primitives for best-in-class accessibility
- Components are copied into your codebase (not a dependency), so fully customizable

**Alternatives:**
- CSS Modules (more boilerplate)
- Styled Components (runtime performance cost)
- Plain CSS (harder to maintain)

**Implementation:**
```tsx
// Mobile-first responsive design
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
```

---

## 5. Testing Strategy: Vitest + Playwright

### Decision: Unit tests with Vitest, E2E tests with Playwright

**Why:**

**Vitest:**
- Fast (Vite-powered)
- Great TypeScript support
- Compatible with Jest APIs (easy migration)
- 26 unit tests covering auth, API client, utilities

**Playwright:**
- Cross-browser E2E testing
- Great debugging tools (trace viewer, screenshots, video)
- Global auth setup avoids login in every test
- 19 E2E tests covering critical user flows

**Test Distribution:**
- Unit tests: Pure functions, utilities, auth helpers
- E2E tests: User flows, RBAC enforcement, token refresh

**Trade-offs:**
- E2E tests are slower but catch integration issues
- Good balance between speed and coverage

---

## 6. API Client: Custom Fetch Wrapper

### Decision: Build custom `apiFetch()` wrapper instead of using axios/react-query

**Why:**
- Native `fetch()` is sufficient for this app
- Custom wrapper handles:
  - Automatic token injection
  - Automatic token refresh on 401
  - Standardized error handling
  - Type safety with generics

**Code:**
```typescript
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
  retry = true
): Promise<T>
```

**Alternatives:**
- **axios**: More features but unnecessary for simple REST API
- **react-query/TanStack Query**: Excellent for caching, but adds complexity for CRUD-heavy app
- **SWR**: Good for read-heavy apps, but we have many mutations

**Trade-offs:**
- No automatic caching (acceptable, data changes frequently)
- Manual refetch after mutations (clear and explicit)
- Would use TanStack Query if: infinite scroll, background refetch, optimistic updates needed

---

## 7. Form Handling: Controlled Components

### Decision: Use React controlled components with useState

**Why:**
- Simple and explicit
- No external form library needed
- Good for straightforward forms (login, create project, create tag)

**Alternatives:**
- react-hook-form (better for complex forms with validation)
- formik (older, more boilerplate)

**When to switch:**
If forms grow to 10+ fields with complex validation rules, react-hook-form would be better.

---

## 8. Deployment Target: Vercel (Assumed)

### Decision: Optimize for Vercel/serverless deployment

**Why:**
- Next.js official deployment platform
- Automatic optimization for App Router
- Zero-config deployment
- CDN, SSL, preview deployments included

**Architecture Implications:**
- No server-side sessions (using JWT instead)
- API calls to separate backend (portfolio-platform-api)
- Static generation where possible, dynamic rendering for auth-protected pages

---

## Summary of Key Principles

1. **Simplicity over Complexity**: Choose the simplest solution that meets requirements
2. **Modern Best Practices**: Follow Next.js 14 App Router patterns
3. **Type Safety**: TypeScript everywhere, including API responses
4. **Testing**: Comprehensive coverage (45 tests) for confidence
5. **Documentation**: Clear README, architecture docs for maintainability
6. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
7. **Security**: JWT tokens, RBAC, automatic token refresh
8. **Performance**: Pagination for large lists, optimized Next.js builds

---

## Future Considerations

As the application grows, these architectural changes might become necessary:

### If User Base Grows to 1000+ Concurrent Users:
- Switch to httpOnly cookies for auth tokens
- Add rate limiting
- Implement caching layer (Redis)

### If Features Grow to 20+ Interconnected Pages:
- Consider Redux Toolkit or Zustand for global state
- Implement TanStack Query for server state caching
- Add react-hook-form for complex forms

### If Real-Time Features Are Added:
- Implement WebSocket connection for live updates
- Add optimistic updates with rollback
- Consider state management library with time-travel debugging

### If Team Grows to 10+ Developers:
- Add Storybook for component documentation
- Implement stricter ESLint rules
- Add Husky for pre-commit hooks
- Consider monorepo structure (if backend is integrated)

---

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
