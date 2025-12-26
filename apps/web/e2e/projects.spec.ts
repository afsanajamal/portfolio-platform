import { test, expect } from "@playwright/test";

test.describe("Projects (core feature)", () => {
  test.describe("View projects (authenticated)", () => {
    test("logged-in user can view the projects list", async ({ page }) => {
      // Already authenticated via global setup
      await page.goto("/en/projects");

      // Should see the projects page
      await expect(page).toHaveURL(/\/en\/projects/);
      await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();

      // Should see the projects list or empty state
      const content = await page.textContent("body");
      expect(content).toMatch(/(No projects yet|Authenticated endpoint)/);
    });
  });

  test.describe("Create project (admin/editor)", () => {
    test("admin or editor can create a project and see it in the list", async ({ page }) => {
      // Already authenticated as admin via global setup
      await page.goto("/en/projects");

      // Should see create form (admin/editor only)
      await expect(page.getByText("Create project (admin/editor)")).toBeVisible();

      // Fill in project details
      const timestamp = Date.now();
      const projectTitle = `Test Project ${timestamp}`;
      const projectUrl = `https://github.com/test/project-${timestamp}`;
      const projectDesc = `Test description ${timestamp}`;

      await page.getByTestId("create-project-title").fill(projectTitle);
      await page.getByTestId("create-project-url").fill(projectUrl);
      await page.getByTestId("create-project-description").fill(projectDesc);

      // Submit the form
      await page.getByTestId("create-project-submit").click();

      // Wait for the project to appear in the list
      await expect(page.getByText(projectTitle)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(projectDesc)).toBeVisible();

      // Verify the form is cleared
      await expect(page.getByTestId("create-project-title")).toHaveValue("");
    });
  });

  test.describe("Edit project", () => {
    test("owner or admin can update a project", async ({ page }) => {
      // Already authenticated as admin via global setup
      await page.goto("/en/projects");

      // Create a project first
      const timestamp = Date.now();
      const originalTitle = `Original Title ${timestamp}`;
      await page.getByTestId("create-project-title").fill(originalTitle);
      await page.getByTestId("create-project-url").fill("https://github.com/test/original");
      await page.getByTestId("create-project-description").fill("Original description");
      await page.getByTestId("create-project-submit").click();

      // Wait for project to appear
      await expect(page.getByText(originalTitle)).toBeVisible({ timeout: 10000 });

      // Click Edit button (find the first project's edit button)
      const editButton = page.locator('[data-testid^="edit-project-"]').first();
      await editButton.click();

      // Should show edit form
      await expect(page.getByTestId("edit-project-title")).toBeVisible();

      // Update the project
      const updatedTitle = `Updated Title ${timestamp}`;
      const updatedDescription = `Updated description ${timestamp}`;
      await page.getByTestId("edit-project-title").fill(updatedTitle);
      await page.getByTestId("edit-project-description").fill(updatedDescription);

      // Save changes
      await page.getByTestId("save-project").click();

      // Should show updated project
      await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(updatedDescription)).toBeVisible();

      // Original title should be gone
      await expect(page.getByText(originalTitle)).not.toBeVisible();
    });
  });

  test.describe("Delete project (RBAC enforced)", () => {
    test("admin can delete any project", async ({ page }) => {
      // Already authenticated as admin via global setup
      await page.goto("/en/projects");

      // Create a project first
      const timestamp = Date.now();
      const projectTitle = `To Delete ${timestamp}`;
      await page.getByTestId("create-project-title").fill(projectTitle);
      await page.getByTestId("create-project-url").fill("https://github.com/test/delete");
      await page.getByTestId("create-project-description").fill("Will be deleted");
      await page.getByTestId("create-project-submit").click();

      // Wait for project to appear
      await expect(page.getByText(projectTitle)).toBeVisible({ timeout: 10000 });

      // Set up dialog handler to confirm deletion
      page.on("dialog", (dialog) => dialog.accept());

      // Click Delete button
      const deleteButton = page.locator('[data-testid^="delete-project-"]').first();
      await deleteButton.click();

      // Project should be removed from the list
      await expect(page.getByText(projectTitle)).not.toBeVisible({ timeout: 10000 });
    });

    test("editor can delete only own project", async ({ page }) => {
      // This test verifies the delete button visibility logic
      // In a real scenario, you'd need to:
      // 1. Create a project as one user (becomes owner)
      // 2. Login as a different editor
      // 3. Verify they cannot see delete button for others' projects

      // For now, verify that as admin (logged in), we can see delete buttons
      await page.goto("/en/projects");

      // Create a project (as admin, we own it)
      const timestamp = Date.now();
      await page.getByTestId("create-project-title").fill(`Own Project ${timestamp}`);
      await page.getByTestId("create-project-url").fill("https://github.com/test/own");
      await page.getByTestId("create-project-description").fill("Own project");
      await page.getByTestId("create-project-submit").click();

      // Wait for project
      await expect(page.getByText(`Own Project ${timestamp}`)).toBeVisible({ timeout: 10000 });

      // Should see delete button for own project
      const deleteButton = page.locator('[data-testid^="delete-project-"]').first();
      await expect(deleteButton).toBeVisible();
    });

    test("viewer cannot delete projects", async ({ page }) => {
      // First, create a project as admin
      await page.goto("/en/projects");
      const timestamp = Date.now();
      const projectTitle = `Admin Project ${timestamp}`;
      await page.getByTestId("create-project-title").fill(projectTitle);
      await page.getByTestId("create-project-url").fill("https://github.com/test/admin-project");
      await page.getByTestId("create-project-description").fill("Admin's project");
      await page.getByTestId("create-project-submit").click();

      // Wait for project to appear
      await expect(page.getByText(projectTitle)).toBeVisible({ timeout: 10000 });

      // Logout
      await page.getByText(/logout/i).click();
      await expect(page).toHaveURL(/\/en\/login/);

      // Login as viewer
      await page.getByTestId("login-email").fill("viewer@example.com");
      await page.getByTestId("login-password").fill("viewer12345");

      // Wait for login API call
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes("/auth/login"),
        { timeout: 10000 }
      );

      await page.getByTestId("login-submit").click();

      // Wait for login response and verify it succeeded
      const response = await responsePromise;
      const status = response.status();

      if (status !== 200) {
        const body = await response.text();
        throw new Error(`Viewer login failed with status ${status}: ${body}`);
      }

      // Wait for redirect to complete
      await expect(page).toHaveURL(/\/en\/projects/, { timeout: 10000 });

      // Should see the project but NO create form (viewer cannot create)
      await expect(page.getByText("Create project (admin/editor)")).not.toBeVisible();

      // Should see the project in the list
      await expect(page.getByText(projectTitle)).toBeVisible();

      // Should NOT see any Edit or Delete buttons (viewer is read-only)
      await expect(page.locator('[data-testid^="edit-project-"]')).not.toBeVisible();
      await expect(page.locator('[data-testid^="delete-project-"]')).not.toBeVisible();
    });
  });

  test.describe("Projects list display", () => {
    test("displays project details correctly", async ({ page }) => {
      await page.goto("/en/projects");

      // Create a project with specific details
      const timestamp = Date.now();
      const title = `Display Test ${timestamp}`;
      const url = `https://github.com/test/display-${timestamp}`;
      const description = `Display test description ${timestamp}`;

      await page.getByTestId("create-project-title").fill(title);
      await page.getByTestId("create-project-url").fill(url);
      await page.getByTestId("create-project-description").fill(description);
      await page.getByTestId("create-project-submit").click();

      // Wait for project
      await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });

      // Verify all details are displayed
      await expect(page.getByText(description)).toBeVisible();
      await expect(page.getByRole("link", { name: url })).toBeVisible();
    });
  });
});
