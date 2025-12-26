import { chromium, type FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // start clean
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto(`${baseURL}/en/login`);
  await page.getByTestId("login-email").fill("admin@example.com");
  await page.getByTestId("login-password").fill("admin12345");
  await page.getByTestId("login-submit").click();

  // wait until we’re not on login
  await page.waitForURL((url) => !url.pathname.includes("/en/login"));

  await page.context().storageState({ path: "e2e/.auth/admin.json" });
  await browser.close();
}
