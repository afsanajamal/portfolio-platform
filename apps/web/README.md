# Project & Portfolio Platform Web

> **Note:** This project is part of the [Portfolio Platform monorepo](../../README.md). For full stack setup instructions, see the [root README](../../README.md).

A production-style frontend application for managing projects and portfolios in a multi-tenant environment.
Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS, featuring JWT authentication, internationalization (English/Japanese), and comprehensive automated testing.

This project is designed as a **portfolio-quality frontend system**, suitable for academic evaluation and frontend team review.

---

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui components
- **Internationalization**: next-intl (English/Japanese)
- **Authentication**: JWT (Access + Refresh tokens)
- **State Management**: React hooks + localStorage
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **CI/CD**: GitHub Actions

---

## Security Note

**Production Build:** ✅ Zero vulnerabilities (`npm audit --production`)

**Development Dependencies:** Some dev tools (esbuild, glob) have known CVEs that only affect local development environments and do not impact production deployments. These are standard in Next.js 14 projects and are not exploitable in production builds.

---

## Core Features

### Authentication & Session Management
- User login with email/password
- JWT-based authentication (access & refresh tokens)
- Automatic token refresh on expiry
- Session expiry detection with auto-redirect to login
- Secure client-side token storage

### Authorization & RBAC
- **Admin**
  - Manage users
  - Full CRUD access to projects and tags
  - Access to audit logs
- **Editor**
  - Create and update projects
  - Create tags
  - Edit/delete own projects only
- **Viewer**
  - Read-only access to projects and tags
  - No create/edit/delete permissions

### Internationalization (i18n)
- English and Japanese language support
- Locale-based routing (`/en/*`, `/ja/*`)
- Language switcher in navigation
- Localized UI text and messages

### Project Management
- View projects list with tags
- Create projects with title, description, URL, and tags
- Update existing projects (admin/editor only)
- Delete projects (admin or project owner)
- Tag-based categorization

### Tag Management
- View all tags
- Create new tags (admin/editor only)
- Viewer sees read-only tag list

### Testing
- 26 unit tests covering auth, API, and utilities
- 19 E2E tests covering:
  - Authentication flows
  - RBAC enforcement
  - Projects CRUD operations
  - Tags CRUD operations
  - Token refresh robustness
- GitHub Actions CI running all tests

---

## Documentation

Detailed project documentation is available below:

- [Project Overview](docs/overview.md)
- [Architecture & Structure](docs/architecture.md)
- [Architecture Decisions (Why React Hooks, JWT, etc.)](docs/architecture-decisions.md)
- [Features & User Flows](docs/features.md)
- [Testing & CI](docs/testing-and-ci.md)
- [Development Guide](docs/development.md)

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Running backend API (see [portfolio-platform-api](https://github.com/afsanajamal/portfolio-platform-api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/afsanajamal/portfolio-platform-web.git
   cd portfolio-platform-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your backend API URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Available Scripts

### Development
- `npm run dev` – Start development server (http://localhost:3000)
- `npm run build` – Build production bundle
- `npm run start` – Start production server
- `npm run lint` – Run ESLint

### Testing
- `npm run test` – Run unit tests in watch mode
- `npm run test:run` – Run unit tests once
- `npm run test:ui` – Run tests with Vitest UI
- `npm run e2e` – Run Playwright E2E tests
- `npm run e2e:ui` – Run E2E tests with UI mode

---

## Test Accounts

For testing purposes, use these accounts (seeded in the backend):

| Role   | Email                    | Password      |
|--------|--------------------------|---------------|
| Admin  | admin@example.com        | admin12345    |
| Editor | editor@example.com       | editor12345   |
| Viewer | viewer@example.com       | viewer12345   |

---

## Project Structure

```
portfolio-platform-web/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-based routing
│   │   ├── login/           # Login page
│   │   ├── projects/        # Projects management
│   │   ├── tags/            # Tags management
│   │   ├── users/           # User management (admin only)
│   │   └── activity/        # Audit logs (admin only)
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui components (button, card, input)
│   └── top-nav.tsx          # Navigation bar
├── lib/                     # Utility libraries
│   ├── api.ts              # API client with auto-refresh
│   └── auth.ts             # Auth utilities
├── messages/                # Internationalization
│   ├── en.json             # English translations
│   └── ja.json             # Japanese translations
├── i18n/                    # i18n configuration
│   ├── config.ts           # Locale settings
│   └── request.ts          # i18n request handler
├── e2e/                     # Playwright E2E tests
│   ├── auth.spec.ts        # Auth flow tests
│   ├── projects.spec.ts    # Projects CRUD tests
│   ├── tags.spec.ts        # Tags CRUD tests
│   └── token-refresh.spec.ts # Token refresh tests
├── tests/                   # Vitest unit tests
│   ├── auth.test.ts        # Auth utilities tests
│   ├── api.test.ts         # API client tests
│   └── tag-mapping.test.ts # Tag mapping tests
└── docs/                    # Documentation
```

---

## Key Technologies Explained

### Next.js App Router
- File-based routing with `app/` directory
- Server and Client Components
- Route handlers for API calls
- Built-in optimization (images, fonts, etc.)

### JWT Authentication
- Access tokens (short-lived, 30 min)
- Refresh tokens (long-lived, 7 days)
- Automatic token refresh on 401 responses
- Stored in localStorage with event-based sync

### next-intl
- Locale-based routing (`/[locale]/...`)
- Translation files in `i18n/`
- Server and client component support
- Type-safe translation keys

### Playwright
- Cross-browser E2E testing
- Global auth setup for authenticated tests
- Video and screenshot capture on failure
- Runs in CI on every push

---

## CI/CD

GitHub Actions automatically:
- Runs unit tests (Vitest)
- Runs E2E tests (Playwright)
- Builds the production bundle
- Fails on test failures or build errors

See [Testing & CI](docs/testing-and-ci.md) for details.

---

## License

This project is for portfolio and educational purposes.
