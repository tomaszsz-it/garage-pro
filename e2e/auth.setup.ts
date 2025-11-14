import { test as setup, expect } from "@playwright/test";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

const E2E_USERNAME = process.env.E2E_USERNAME;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

if (!E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("E2E_USERNAME and E2E_PASSWORD must be set");
}

setup("authenticate", async ({ page, baseURL }) => {
  // Navigate to login page and wait for it to load
  await page.goto(`${baseURL}/auth/login`);

  // Wait for and fill email input
  const emailInput = page.locator("#email");
  await emailInput.waitFor({ state: "visible" });
  await emailInput.click();
  await emailInput.fill(E2E_USERNAME);
  await expect(emailInput).toHaveValue(E2E_USERNAME);

  // Wait for and fill password input
  const passwordInput = page.locator("#password");
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.click();
  await passwordInput.fill(E2E_PASSWORD);
  await expect(passwordInput).toHaveValue(E2E_PASSWORD);

  // Wait for and click submit button
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.waitFor({ state: "visible" });

  // Click submit and wait for either success or error
  await submitButton.click();

  // Wait a moment for any immediate feedback
  await page.waitForTimeout(3000);

  // Debug: Check current state
  const currentURL = page.url();
  console.log("Current URL after login attempt:", currentURL);

  // Check for various possible outcomes
  const pageTitle = await page.title();
  console.log("Page title:", pageTitle);

  // Check for error messages with different selectors
  const errorSelectors = [
    '[data-testid="error-message"]',
    ".text-red-300",
    ".text-red-400",
    ".bg-red-500",
    "text=Wystąpił błąd",
  ];

  for (const selector of errorSelectors) {
    const errorElement = page.locator(selector).first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      throw new Error(`Login failed with error: ${errorText} (found with selector: ${selector})`);
    }
  }

  // Check if we're still on login page (likely failed)
  if (currentURL.includes("/auth/login")) {
    // Try to get any error text from the page
    const bodyText = await page.locator("body").textContent();
    console.log("Page body text (first 500 chars):", bodyText?.substring(0, 500));

    throw new Error(`Login failed - still on login page. Please check credentials or server status.`);
  }

  // Check if login was successful
  if (currentURL.includes("/reservations")) {
    console.log("✅ Login successful - navigated to reservations page");
  } else if (pageTitle.includes("Rezerwacje")) {
    console.log("✅ Login successful - on reservations page (title check)");
  } else {
    console.log("❌ Login failed - still on login page");
    throw new Error(`Login failed - still on ${currentURL} with title "${pageTitle}"`);
  }

  // Store authentication state
  await page.context().storageState({ path: authFile });
});
