# Features & User Flows

## Authentication

### Login
1. User navigates to `/[locale]/login`
2. Enters email and password
3. Submits form
4. On success:
   - Access and refresh tokens stored in localStorage
   - User redirected to `/[locale]/projects`
5. On failure:
   - Error message displayed
   - User remains on login page

### Session Management
- Access tokens expire after 30 minutes
- When an API call returns 401:
  - Frontend automatically refreshes token using refresh token
  - Original request is retried with new access token
- When refresh token expires:
  - Auth is cleared
  - User redirected to login page

### Logout
1. User clicks "Logout" in navigation
2. Tokens cleared from localStorage
3. User redirected to `/[locale]/login`

---

## Projects (Core Feature)

### View Projects (All Roles)
- All authenticated users can view projects list
- Projects display:
  - Title
  - Description
  - GitHub URL
  - Associated tags
  - Owner information

### Create Project (Admin/Editor)
1. Admin or Editor navigates to `/[locale]/projects`
2. Sees "Create project" form
3. Fills in:
   - Title (required)
   - Description (required)
   - GitHub URL (required)
   - Tags (optional, multi-select)
4. Submits form
5. New project appears at top of list

### Edit Project (Admin/Owner)
1. Admin (any project) or project owner clicks "Edit"
2. Form pre-populated with current values
3. User modifies fields
4. Clicks "Save"
5. Updated project displayed in list

### Delete Project (Admin/Owner)
1. Admin (any project) or project owner clicks "Delete"
2. Confirmation dialog appears
3. User confirms
4. Project removed from list

### Viewer Permissions
- Viewers see projects list
- No "Create" form visible
- No "Edit" or "Delete" buttons visible

---

## Tags (Supporting Feature)

### View Tags (All Roles)
- All authenticated users can view tag list
- Tags displayed as pills/badges

### Create Tag (Admin/Editor)
1. Admin or Editor navigates to `/[locale]/tags`
2. Sees "Create tag" form
3. Enters tag name
4. Submits form
5. New tag appears in list

### Viewer Permissions
- Viewers see tag list
- Message shows "View tags (read-only)"
- No create form visible

---

## Users (Admin Only)

### View Users
- Admin navigates to `/[locale]/users`
- Sees list of all users in organization:
  - Email
  - Role
  - Creation date

### Create User
1. Admin fills in user form:
   - Email (required)
   - Password (required)
   - Role: Editor or Viewer (cannot create Admin)
2. Submits form
3. New user appears in list

### Non-Admin Permissions
- Editor and Viewer redirected to `/[locale]/projects` when accessing `/users`

---

## Activity Logs (Admin Only)

### View Audit Logs
- Admin navigates to `/[locale]/activity`
- Sees chronological list of actions:
  - Action type (CREATE, UPDATE, DELETE)
  - Entity (project, user, tag)
  - Actor (who performed the action)
  - Timestamp

### Filtering
- Admin can filter logs by entity type (all, project, user, tag)
- Pagination available (load more)

### Non-Admin Permissions
- Editor and Viewer redirected to `/[locale]/projects` when accessing `/activity`

---

## Internationalization

### Language Switching
1. User clicks language selector in navigation
2. Chooses English or Japanese
3. Page reloads with new locale
4. All UI text translated
5. Route updated (e.g., `/en/projects` → `/ja/projects`)

### Supported Locales
- **English** (`/en/*`)
- **Japanese** (`/ja/*`)

---

## Role-Based Access Control (RBAC)

### Permission Matrix

| Feature               | Admin | Editor | Viewer |
|-----------------------|-------|--------|--------|
| View projects         | ✓     | ✓      | ✓      |
| Create project        | ✓     | ✓      | ✗      |
| Edit own project      | ✓     | ✓      | ✗      |
| Edit any project      | ✓     | ✗      | ✗      |
| Delete own project    | ✓     | ✓      | ✗      |
| Delete any project    | ✓     | ✗      | ✗      |
| View tags             | ✓     | ✓      | ✓      |
| Create tag            | ✓     | ✓      | ✗      |
| View users            | ✓     | ✗      | ✗      |
| Create user           | ✓     | ✗      | ✗      |
| View activity logs    | ✓     | ✗      | ✗      |

---

## Error Handling

### Network Errors
- API errors displayed to user
- Retry button shown when appropriate

### Session Expiry
- On token refresh failure:
  - Auth cleared
  - User redirected to login
  - No error message shown (seamless redirect)

### Validation Errors
- Form validation errors displayed inline
- Required fields highlighted

### 404 Not Found
- Invalid routes show Next.js 404 page
- User can navigate back to home

---

## Responsive Design

All pages are responsive and work on:
- Desktop (1280px+)
- Tablet (768px - 1279px)
- Mobile (320px - 767px)

Navigation collapses to hamburger menu on mobile (future enhancement).
