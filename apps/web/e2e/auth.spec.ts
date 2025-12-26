import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Unauthenticated redirect", () => {
    test("visiting /projects while logged out redirects to /login", async ({ page }) => {
      // Clear auth before the app loads
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to access protected route
      await page.goto("/en/projects");

      // Should redirect to login
      await expect(page).toHaveURL(/\/en\/login/);
    });

    test("visiting /tags while logged out redirects to /login", async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto("/en/tags");
      await expect(page).toHaveURL(/\/en\/login/);
    });

    test("visiting /users while logged out redirects to /projects", async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto("/en/users");
      // Non-authenticated users get redirected to projects, then to login
      await expect(page).toHaveURL(/\/en\/(login|projects)/);
    });
  });

  test.describe("Login success", () => {
    test("valid credentials log the user in and redirect to /projects", async ({ page }) => {
      // Clear auth before the app loads
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Go to login page
      await page.goto("/en/login");

      // Fill in valid credentials
      await page.getByTestId("login-email").fill("admin@example.com");
      await page.getByTestId("login-password").fill("admin12345");

      // Wait for the login API call
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes("/auth/login"),
        { timeout: 10000 }
      );

      await page.getByTestId("login-submit").click();

      // Wait for successful login response
      const response = await responsePromise;
      expect(response.status()).toBe(200);

      // Should redirect to projects
      await expect(page).toHaveURL(/\/en\/projects/, { timeout: 10000 });

      // Verify we can see projects page content (heading)
      await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();
    });
  });

  test.describe("Login failure", () => {
    test("invalid credentials show an error and stay on /login", async ({ page }) => {
      // Clear auth before the app loads
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Go to login page
      await page.goto("/en/login");

      // Fill in invalid credentials
      await page.getByTestId("login-email").fill("wrong@example.com");
      await page.getByTestId("login-password").fill("wrongpassword");

      // Wait for the login API call (will fail)
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes("/auth/login"),
        { timeout: 10000 }
      );

      await page.getByTestId("login-submit").click();

      // Wait for failed login response
      const response = await responsePromise;
      expect(response.status()).not.toBe(200);

      // Should stay on login page
      await expect(page).toHaveURL(/\/en\/login/);

      // Should show error message
      await expect(page.getByText(/error|failed|invalid/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Logout", () => {
    test("user can logout and is redirected appropriately", async ({ page }) => {
      // Start with authenticated session (from global setup)
      await page.goto("/en/projects");

      // Verify we're logged in
      await expect(page.getByText(/logout/i)).toBeVisible();

      // Click logout button
      await page.getByText(/logout/i).click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/en\/login/, { timeout: 5000 });

      // Try to access protected route after logout
      await page.goto("/en/projects");

      // Should redirect back to login
      await expect(page).toHaveURL(/\/en\/login/);
    });
  });
});
