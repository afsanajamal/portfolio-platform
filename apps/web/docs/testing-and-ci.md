# Testing & CI

## Testing Strategy

The project uses a **two-tier testing approach**:

1. **Unit Tests** - Fast, isolated tests for utilities and components
2. **E2E Tests** - Full user flow tests simulating real usage

This ensures both code correctness and real-world functionality.

---

## Unit Testing (Vitest)

### Test Framework
- **Vitest** - Fast, Vite-native test runner
- **React Testing Library** - Test components like users interact with them
- **jsdom** - Simulated browser environment

### What We Test

#### Authentication Utilities (`tests/auth.test.ts`)
- Token storage and retrieval
- Auth state checks
- Role validation
- User ID management
- Auth clearing

**12 tests covering:**
- `isAuthed()` - Returns true when valid tokens exist
- `getRole()` - Returns correct user role
- `clearAuth()` - Clears all auth data
- `setAuth()` - Stores auth data correctly

#### API Client (`tests/api.test.ts`)
- Error handling
- Response parsing
- Request formatting

**7 tests covering:**
- 400 Bad Request errors
- 500 Server errors
- Network failures
- JSON parsing

#### Tag Mapping Logic (`tests/tag-mapping.test.ts`)
- Tag ID to name conversion
- Tag selection handling

**6 tests total**

### Running Unit Tests

```bash
# Watch mode (auto-rerun on changes)
npm run test

# Run once
npm run test:run

# With UI
npm run test:ui
```

---

## E2E Testing (Playwright)

### Test Framework
- **Playwright** - Cross-browser E2E testing
- **Chromium** - Default browser for tests
- Global authentication setup for speed

### What We Test

#### Authentication (`e2e/auth.spec.ts`) - 6 tests
1. Unauthenticated redirect - `/projects` → `/login`
2. Unauthenticated redirect - `/tags` → `/login`
3. Unauthenticated redirect - `/users` → `/projects`
4. Login success - Valid credentials redirect to `/projects`
5. Login failure - Invalid credentials show error
6. Logout - User redirected to `/login`

#### Projects CRUD (`e2e/projects.spec.ts`) - 7 tests
1. Logged-in user can view projects list
2. Admin/editor can create project
3. Admin/editor can edit project
4. Admin can delete any project
5. Editor can delete only own project
6. **Viewer cannot delete projects** (RBAC enforcement)
7. Project details display correctly

#### Tags CRUD (`e2e/tags.spec.ts`) - 3 tests
1. Logged-in user can view tags list
2. Admin/editor can create tag
3. **Viewer cannot create tag** - No create UI visible (RBAC enforcement)

#### Token Refresh (`e2e/token-refresh.spec.ts`) - 2 tests
1. **Expired access token is refreshed** - Original request succeeds
2. **Refresh token failure** - Auth cleared, redirected to login

#### Smoke Test (`e2e/smoke.spec.ts`) - 1 test
1. Home page loads successfully

**Total: 19 E2E tests**

### Running E2E Tests

```bash
# Ensure backend is running first
# cd ../portfolio-platform-api
# uvicorn app.main:app

# Run E2E tests
npm run e2e

# With UI mode
npm run e2e:ui
```

### Global Authentication Setup

To avoid logging in for every test:
- `e2e/global-setup.ts` logs in once before all tests
- Auth state saved to `e2e/.auth/admin.json`
- All tests reuse this authentication

This makes tests **10x faster**.

---

## Test Coverage

### By Category

| Category           | Unit Tests | E2E Tests |
|--------------------|------------|-----------|
| Authentication     | 12         | 6         |
| API Client         | 7          | 0         |
| Projects CRUD      | 0          | 7         |
| Tags CRUD          | 0          | 3         |
| Token Refresh      | 0          | 2         |
| Utilities          | 7          | 0         |
| Smoke              | 0          | 1         |
| **Total**          | **26**     | **19**    |

### Critical Paths Covered

✅ **User can log in and out**
✅ **Admin can manage all projects**
✅ **Editor can create/edit/delete own projects**
✅ **Viewer can only view projects** (RBAC enforced)
✅ **Token refresh works automatically**
✅ **Session expiry redirects to login**
✅ **Internationalization works** (EN/JA)

---

## Continuous Integration (GitHub Actions)

### Workflow: `.github/workflows/frontend-tests.yml`

On every push and pull request:

1. **Install Dependencies**
   ```bash
   npm ci
   ```

2. **Run Unit Tests**
   ```bash
   npm run test:run
   ```

3. **Setup Backend API**
   - Checkout backend repository
   - Install Python dependencies
   - Run database migrations
   - Seed test data
   - Start backend server in background

4. **Build Frontend**
   ```bash
   npm run build
   ```

5. **Run E2E Tests**
   ```bash
   npx playwright install --with-deps
   npm run e2e
   ```

6. **Upload Artifacts** (on failure)
   - Screenshots
   - Videos
   - Test reports

### CI Test Accounts

The CI uses seeded test accounts:
- `admin@example.com` / `admin12345`
- `editor@example.com` / `editor12345`
- `viewer@example.com` / `viewer12345`

All accounts in the same organization for testing.

---

## Test Best Practices

### Unit Tests
- ✅ Test utilities in isolation
- ✅ Mock browser APIs (localStorage)
- ✅ Fast execution (< 1 second)
- ✅ No external dependencies

### E2E Tests
- ✅ Test complete user flows
- ✅ Use real backend API
- ✅ Use test IDs (data-testid) for reliable selectors
- ✅ Add unique timestamps to test data (avoid conflicts)
- ✅ Wait for API responses, not arbitrary timeouts
- ✅ Clean up test data (or use fresh database)

### CI
- ✅ Run on every push and PR
- ✅ Fail fast on errors
- ✅ Cache dependencies for speed
- ✅ Save artifacts on failure

---

## Why Testing Matters

1. **Confidence in Changes**
   - Refactor without fear
   - Catch regressions early

2. **Documentation**
   - Tests show how code should work
   - Examples for future developers

3. **Professional Workflow**
   - Industry-standard practice
   - Required for team environments

4. **RBAC Enforcement**
   - Critical that viewers can't edit
   - Tests verify this rigorously

This testing strategy ensures **production-quality code**.
