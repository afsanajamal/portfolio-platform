# Contributing to Portfolio Platform

Thank you for your interest in contributing to the Portfolio Platform! This document provides guidelines and best practices for contributing to this monorepo.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/portfolio-platform.git`
3. Follow the setup instructions in the [root README](../README.md)
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running the Development Environment

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev

# Or run them individually
npm run dev:web   # Frontend only
npm run dev:api   # Backend only
```

### Making Changes

1. Make your changes in the appropriate app directory (`apps/web` or `apps/api`)
2. Write tests for your changes
3. Run tests locally: `npm run test`
4. Run linting: `npm run lint`
5. Commit your changes following our commit message guidelines

## Code Standards

### Frontend (Next.js/TypeScript)

- **Language**: TypeScript (strict mode)
- **Style Guide**: Follow existing ESLint configuration
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind CSS utility classes
- **UI Components**: Prefer shadcn/ui components when available
- **File Naming**:
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Utilities: camelCase (e.g., `formatDate.ts`)
  - Pages: kebab-case or Next.js conventions
- **Imports**: Use absolute imports with `@/` prefix

### Backend (FastAPI/Python)

- **Language**: Python 3.13+
- **Style Guide**: Follow PEP 8
- **Type Hints**: Use type hints for all function signatures
- **Formatting**: Code should be formatted (consider using black or ruff)
- **File Naming**: snake_case for all Python files
- **Docstrings**: Use docstrings for public functions and classes

### General Principles

- **DRY**: Don't repeat yourself - extract common logic
- **KISS**: Keep it simple and straightforward
- **Single Responsibility**: Each function/class should have one clear purpose
- **Security**: Never commit secrets, credentials, or sensitive data
- **Comments**: Write self-documenting code; add comments only when necessary for complex logic

## Testing Requirements

All contributions must include appropriate tests:

### Frontend Tests

- **Unit Tests**: Use Vitest for component and utility testing
- **E2E Tests**: Use Playwright for critical user flows
- **Location**: Place tests next to the code they test or in `__tests__` directories
- **Coverage**: Aim for meaningful test coverage, not arbitrary percentages

```bash
# Run frontend tests
npm run test:web

# Run E2E tests
cd apps/web && npm run test:e2e
```

### Backend Tests

- **Unit Tests**: Use pytest for all business logic
- **Integration Tests**: Test API endpoints with test database
- **Location**: Tests in `tests/` directory matching source structure
- **Fixtures**: Use pytest fixtures for common test setup

```bash
# Run backend tests
npm run test:api
```

### Test Quality Standards

- Tests should be independent and isolated
- Use descriptive test names that explain what is being tested
- Mock external dependencies appropriately
- Clean up test data after each test

## Pull Request Process

1. **Before Creating PR**:
   - Ensure all tests pass locally
   - Run linting and fix any issues
   - Update documentation if needed
   - Rebase on latest main branch

2. **Creating the PR**:
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Reference any related issues (e.g., "Fixes #123")
   - Add screenshots/videos for UI changes
   - Mark as draft if not ready for review

3. **PR Description Should Include**:
   - Summary of changes
   - Motivation/context
   - Testing performed
   - Any breaking changes
   - Checklist of completed items

4. **Review Process**:
   - Address all reviewer comments
   - Push additional commits (don't force push during review)
   - Mark conversations as resolved when addressed
   - Request re-review when ready

5. **Merging**:
   - Ensure CI passes
   - Get at least one approval
   - Squash commits if requested
   - Merge via GitHub UI

## Commit Message Guidelines

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies

### Scopes

- `web`: Frontend changes
- `api`: Backend changes
- `docs`: Documentation
- `ci`: CI/CD changes
- `monorepo`: Changes affecting the entire monorepo

### Examples

```
feat(web): add user profile edit functionality

Implement profile editing form with validation and image upload support

Fixes #42
```

```
fix(api): correct token refresh endpoint error handling

The refresh endpoint was not properly handling expired refresh tokens,
leading to 500 errors instead of 401.
```

```
docs: add deployment guide for production environments
```

## Questions or Issues?

- Check existing [documentation](../README.md)
- Search [existing issues](https://github.com/YOUR_USERNAME/portfolio-platform/issues)
- Create a new issue with detailed information

Thank you for contributing!
