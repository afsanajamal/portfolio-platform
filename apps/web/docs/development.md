# Development Guide

Quick reference for common development tasks.

---

## Setup

### First Time Setup

```bash
# Clone repository
git clone https://github.com/afsanajamal/portfolio-platform-web.git
cd portfolio-platform-web

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

**Required:**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: `http://127.0.0.1:8000`)

---

## Common Tasks

### Start Development Server

```bash
npm run dev
```

Opens at http://localhost:3000

### Run Tests

```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npm run test:run

# E2E tests (requires backend running)
npm run e2e

# E2E with UI mode
npm run e2e:ui
```

### Build for Production

```bash
npm run build
npm run start
```

### Lint Code

```bash
npm run lint
```

---

## Adding New Features

### Adding a New Page

1. Create file in `app/[locale]/your-page/page.tsx`
2. Add client component if interactive:
   ```tsx
   "use client";

   export default function YourPage() {
     return <div>Your content</div>;
   }
   ```

3. Add to navigation in `components/top-nav.tsx`
4. Add translations in `messages/en.json` and `messages/ja.json`
5. Add E2E tests in `e2e/your-page.spec.ts`

### Adding API Endpoints

Add to `lib/api.ts`:

```typescript
export async function yourApiCall(): Promise<YourType> {
  return apiFetch<YourType>("/your-endpoint", {
    method: "GET",
    auth: true, // Include auth token
  });
}
```

### Adding Translations

1. Add to `messages/en.json`:
   ```json
   {
     "yourPage": {
       "title": "Your Title",
       "description": "Your description"
     }
   }
   ```

2. Add to `messages/ja.json` (Japanese translation)

3. Use in component:
   ```tsx
   import { useTranslations } from "next-intl";

   const t = useTranslations("yourPage");
   <h1>{t("title")}</h1>
   ```

### Adding UI Components

This project uses **shadcn/ui** for UI components. Components are installed into your codebase (not as dependencies), making them fully customizable.

To add a new component:

```bash
npx shadcn@latest add <component-name>
```

Examples:
```bash
# Add a dialog component
npx shadcn@latest add dialog

# Add a dropdown menu
npx shadcn@latest add dropdown-menu

# Add a badge component
npx shadcn@latest add badge

# Add multiple components at once
npx shadcn@latest add dialog dropdown-menu badge
```

Components will be added to `components/ui/` and can be imported like:
```tsx
import { Dialog } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
```

See the [shadcn/ui docs](https://ui.shadcn.com) for all available components.

---

## Testing

### Writing Unit Tests

Create `tests/your-feature.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Your Feature", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### Writing E2E Tests

Create `e2e/your-feature.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Your Feature", () => {
  test("should work", async ({ page }) => {
    await page.goto("/en/your-page");
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
```

**Best Practices:**
- Use `data-testid` for reliable selectors
- Wait for API responses, not arbitrary timeouts
- Add unique timestamps to test data
- Clean up after tests (or use fresh database)

---

## Authentication

### Checking Auth State

```typescript
import { isAuthed, getRole } from "@/lib/auth";

if (!isAuthed()) {
  // Redirect to login
}

const role = getRole(); // "admin" | "editor" | "viewer" | null
```

### Making Authenticated API Calls

```typescript
import { apiFetch } from "@/lib/api";

const data = await apiFetch("/projects", {
  method: "GET",
  auth: true, // Include auth token
});
```

### Listening to Auth Changes

```typescript
useEffect(() => {
  const checkAuth = () => {
    if (!isAuthed()) {
      router.replace("/en/login");
    }
  };

  checkAuth();
  window.addEventListener("pp-auth-changed", checkAuth);

  return () => {
    window.removeEventListener("pp-auth-changed", checkAuth);
  };
}, [router]);
```

---

## RBAC Patterns

### Hiding UI Based on Role

```typescript
const role = getRole();
const canCreate = role === "admin" || role === "editor";

return (
  <div>
    {canCreate && (
      <Button>Create Project</Button>
    )}
  </div>
);
```

### Redirecting Based on Role

```typescript
useEffect(() => {
  const role = getRole();

  if (role !== "admin") {
    router.replace("/en/projects");
  }
}, [router]);
```

---

## Debugging

### Browser DevTools

- **Console**: Check for errors and logs
- **Network**: Inspect API requests/responses
- **Application → Local Storage**: Check stored tokens

### Playwright Debug Mode

```bash
# Run with --debug flag
npx playwright test --debug

# Or use UI mode
npm run e2e:ui
```

### Vitest UI

```bash
npm run test:ui
```

Opens interactive test UI in browser.

---

## Common Issues

### "Invalid credentials" on login
- Check backend is running
- Verify test accounts seeded: `python scripts/seed_admin.py`
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### E2E tests failing
- Ensure backend is running: `uvicorn app.main:app`
- Check backend database is seeded
- Clear `e2e/.auth/` and rerun global setup

### Hydration errors
- Check `typeof window` checks are in `useEffect`, not render
- Ensure server/client components return same initial HTML

### "Module not found" errors
- Run `npm install`
- Check import paths are correct
- Restart dev server

---

## Code Style

### TypeScript
- Use explicit types for function parameters and return values
- Avoid `any`, use `unknown` if type is truly unknown
- Enable strict mode (already configured)

### React
- Prefer functional components over class components
- Use hooks (useState, useEffect, etc.)
- Keep components small and focused

### Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

### Formatting
- Run `npm run lint` before committing
- Use Prettier for formatting (built into ESLint config)

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push to GitHub
git push origin feature/your-feature

# Create pull request on GitHub
```

### Commit Message Format

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Add/update tests
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Build/config changes

---

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [next-intl](https://next-intl-docs.vercel.app)
- [Playwright](https://playwright.dev)
- [Vitest](https://vitest.dev)
