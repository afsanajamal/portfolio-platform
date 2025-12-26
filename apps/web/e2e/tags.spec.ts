import { test, expect } from "@playwright/test";

test.describe("Tags (supporting feature)", () => {
  test.describe("View tags (authenticated)", () => {
    test("logged-in user can view the tags list", async ({ page }) => {
      // Already authenticated via global setup
      await page.goto("/en/tags");

      // Should see the tags page
      await expect(page).toHaveURL(/\/en\/tags/);
      await expect(page.getByRole("heading", { name: /^tags$/i })).toBeVisible();

      // Should see either the tags list or empty state
      const content = await page.textContent("body");
      expect(content).toMatch(/(No tags found|Tag list)/);
    });
  });

  test.describe("Create tag (admin/editor)", () => {
    test("admin or editor can create a tag and see it in the list", async ({ page }) => {
      // Already authenticated as admin via global setup
      await page.goto("/en/tags");

      // Should see create form (admin/editor only)
      await expect(page.getByTestId("create-tag-form")).toBeVisible();

      // Fill in tag name
      const timestamp = Date.now();
      const tagName = `Test Tag ${timestamp}`;

      await page.getByTestId("create-tag-name").fill(tagName);

      // Submit the form
      await page.getByTestId("create-tag-submit").click();

      // Wait for the tag to appear in the list
      await expect(page.getByText(tagName)).toBeVisible({ timeout: 10000 });

      // Verify the form is cleared
      await expect(page.getByTestId("create-tag-name")).toHaveValue("");
    });
  });

  test.describe("Viewer cannot create tag", () => {
    test("viewer role does not see create UI", async ({ page }) => {
      // First, create a tag as admin
      await page.goto("/en/tags");
      const timestamp = Date.now();
      const tagName = `Admin Tag ${timestamp}`;

      await page.getByTestId("create-tag-name").fill(tagName);
      await page.getByTestId("create-tag-submit").click();

      // Wait for tag to appear
      await expect(page.getByText(tagName)).toBeVisible({ timeout: 10000 });

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

      // Navigate to tags page
      await page.goto("/en/tags");

      // Should see the tags page
      await expect(page).toHaveURL(/\/en\/tags/);

      // Should see the tag created by admin
      await expect(page.getByText(tagName)).toBeVisible();

      // Should NOT see create form (viewer is read-only)
      await expect(page.getByTestId("create-tag-form")).not.toBeVisible();

      // Should see read-only message
      await expect(page.getByText(/view tags \(read-only\)/i)).toBeVisible();
    });
  });
});
