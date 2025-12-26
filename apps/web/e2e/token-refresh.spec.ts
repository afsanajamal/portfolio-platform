import { test, expect } from "@playwright/test";

test.describe("Auth robustness", () => {
  test.describe("Access token refresh", () => {
    test("expired access token is refreshed and original request succeeds", async ({ page }) => {
      // Login to get valid tokens
      await page.goto("/en/login");
      await page.getByTestId("login-email").fill("admin@example.com");
      await page.getByTestId("login-password").fill("admin12345");
      await page.getByTestId("login-submit").click();

      // Wait for successful login
      await expect(page).toHaveURL(/\/en\/projects/, { timeout: 10000 });

      // Navigate to projects page to ensure we're authenticated
      await page.goto("/en/projects");
      await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();

      // Get the current refresh token before we invalidate the access token
      const refreshToken = await page.evaluate(() => {
        return localStorage.getItem("pp_refresh_token");
      });

      expect(refreshToken).toBeTruthy();

      // Invalidate the access token by setting it to an expired/invalid token
      // Keep the refresh token valid so it can be used to get a new access token
      await page.evaluate(() => {
        localStorage.setItem("pp_access_token", "invalid_expired_token_that_will_get_401");
      });

      // Set up a listener for the /auth/refresh endpoint to confirm refresh happens
      const refreshPromise = page.waitForResponse(
        (response) => response.url().includes("/auth/refresh"),
        { timeout: 10000 }
      );

      // Now make a request that requires authentication
      // This should trigger a 401, then auto-refresh, then succeed
      await page.goto("/en/tags");

      // Wait for the token refresh to complete
      const refreshResponse = await refreshPromise;
      expect(refreshResponse.status()).toBe(200);

      // If the refresh worked, we should see the tags page successfully
      await expect(page).toHaveURL(/\/en\/tags/, { timeout: 10000 });
      await expect(page.getByRole("heading", { name: /^tags$/i })).toBeVisible();

      // Verify we can still make authenticated requests (token was refreshed)
      await expect(page.getByText(/Tag list|No tags found/i)).toBeVisible();

      // Verify the access token was updated (it should be different from the invalid one)
      const newAccessToken = await page.evaluate(() => {
        return localStorage.getItem("pp_access_token");
      });

      expect(newAccessToken).toBeTruthy();
      expect(newAccessToken).not.toBe("invalid_expired_token_that_will_get_401");
    });

    test("refresh token failure clears auth and redirects to login", async ({ page }) => {
      // Login to get valid tokens
      await page.goto("/en/login");
      await page.getByTestId("login-email").fill("admin@example.com");
      await page.getByTestId("login-password").fill("admin12345");
      await page.getByTestId("login-submit").click();

      // Wait for successful login
      await expect(page).toHaveURL(/\/en\/projects/, { timeout: 10000 });

      // Invalidate BOTH access token and refresh token
      await page.evaluate(() => {
        localStorage.setItem("pp_access_token", "invalid_access_token");
        localStorage.setItem("pp_refresh_token", "invalid_refresh_token");
      });

      // Try to navigate to an authenticated page
      await page.goto("/en/projects");

      // Should be redirected to login because both tokens are invalid
      await expect(page).toHaveURL(/\/en\/login/, { timeout: 10000 });

      // Verify auth was cleared
      const accessToken = await page.evaluate(() => {
        return localStorage.getItem("pp_access_token");
      });

      expect(accessToken).toBeNull();
    });
  });
});
