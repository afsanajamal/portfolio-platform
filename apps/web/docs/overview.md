# Project Overview

This project is a frontend web application for a **multi-tenant project & portfolio platform**.

The application allows users to manage projects and tags with strict role-based access control (RBAC), connecting to a FastAPI backend.
It is designed to demonstrate **real-world frontend engineering practices**, not tutorial-level examples.

The application supports:
- JWT-based authentication with automatic token refresh
- Role-based authorization (admin / editor / viewer)
- Internationalization (English/Japanese)
- Project and tag management
- Comprehensive automated testing (unit + E2E)

This project was built as:
- A frontend portfolio project
- Demonstration of modern React/Next.js patterns
- Supporting material for postgraduate (Master's) applications

---

## Core Use Case

Users can:
- Log in with email and password
- View projects and tags based on their role
- Create/edit/delete projects (admin/editor only)
- Create tags (admin/editor only)
- Switch between English and Japanese languages
- Access audit logs (admin only)

Users **can only access data from their own organization**.

---

## Key Goals

- Demonstrate frontend fundamentals clearly
- Use production-style architecture and patterns
- Implement secure authentication and authorization
- Keep the codebase testable and maintainable
- Follow accessibility best practices

---

## Non-Goals

- Backend API development (handled in a separate project)
- Advanced state management libraries (Redux, Zustand, etc.)
- Server-side rendering for every page
- Complex animations or UI effects

The focus is on **correctness, clarity, and frontend design**.

---

## Target Audience

This project is intended for:
- Academic reviewers (Master's program applications)
- Frontend engineering teams
- Portfolio evaluation
- Learning modern Next.js patterns
