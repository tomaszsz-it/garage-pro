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

  // Wait for React component to hydrate by waiting for the form element
  await page.waitForSelector("form");

  // Wait for and fill email input - use type() instead of fill() for better React compatibility
  const emailInput = page.locator("#email");
  await emailInput.waitFor({ state: "visible" });
  await emailInput.click();
  await emailInput.clear();
  await emailInput.type(E2E_USERNAME, { delay: 100 }); // Add delay to ensure React state updates
  await expect(emailInput).toHaveValue(E2E_USERNAME);

  // Wait for and fill password input
  const passwordInput = page.locator("#password");
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.click();
  await passwordInput.clear();
  await passwordInput.type(E2E_PASSWORD, { delay: 100 }); // Add delay to ensure React state updates
  await expect(passwordInput).toHaveValue(E2E_PASSWORD);

  // Wait for and click submit button
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.waitFor({ state: "visible" });

  // Click submit and wait for either success or error
  await submitButton.click();

  // Wait a moment for any immediate feedback
  await page.waitForTimeout(2000);

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

  // Check if login was successful by looking for reservation content
  const hasReservationContent =
    (await page.locator("text=Twoje Rezerwacje").first().isVisible()) ||
    pageTitle.includes("Rezerwacje") ||
    currentURL.includes("/reservations");

  if (hasReservationContent) {
    console.log("✅ Login successful - reservation content found");
  } else {
    // Check for errors if login didn't succeed
    const errorElement = page.locator('[data-testid="error-message"], .text-red-300, .text-red-400').first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    throw new Error(`Login failed - no reservation content found on ${currentURL}`);
  }

  // Store authentication state
  await page.context().storageState({ path: authFile });
});
