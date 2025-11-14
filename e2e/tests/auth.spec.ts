import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Authentication", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form", async () => {
    await loginPage.expectToBeLoaded();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await loginPage.loginButton.click();

    // Check for client-side validation error messages (field-level errors use text-red-300)
    await expect(page.locator(".text-red-300").filter({ hasText: "Adres e-mail jest wymagany" })).toBeVisible();
    await expect(page.locator(".text-red-300").filter({ hasText: "Hasło jest wymagane" })).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page, baseURL }) => {
    // Navigate to a fresh page and set up interception
    await page.goto(`${baseURL}/auth/login`);
    await page.waitForSelector("form");

    // Intercept login API call
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            message: "Invalid credentials",
          },
        }),
      });
    });

    // Fill and submit form
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    // Wait for error to appear
    await page.waitForTimeout(2000);

    // Verify error handling
    await expect(page.locator(".text-red-200").filter({ hasText: "Invalid credentials" })).toBeVisible();
  });

  test("should validate email format", async () => {
    await loginPage.emailInput.fill("invalid-email");
    await loginPage.passwordInput.fill("somepassword");
    await loginPage.loginButton.click();

    // Check for email validation
    const emailInput = loginPage.emailInput;
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toContain("email");
  });

  test("should have accessible form labels", async ({ page }) => {
    await expect(loginPage.emailInput).toHaveAttribute("type", "email");
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");

    // Check for proper labels or aria-labels
    const emailLabel = page.locator('label[for="email"], [aria-label*="email"]');
    const passwordLabel = page.locator('label[for="password"], [aria-label*="password"]');

    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test("should have working forgot password link", async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);
  });

  test("should have working register link", async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/.*\/auth\/register/);
  });

  // API testing example
  test("should make proper API call on login", async ({ page, baseURL }) => {
    // Navigate to a fresh page and set up interception before any API calls
    await page.goto(`${baseURL}/auth/login`);
    await page.waitForSelector("form");

    // Set up route interception
    await page.route("**/api/auth/login", async (route) => {
      console.log("Intercepted API call:", route.request().url());
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            message: "Invalid credentials",
          },
        }),
      });
    });

    // Fill and submit form
    await page.fill("#email", "test@example.com");
    await page.fill("#password", "password");
    await page.click('button[type="submit"]');

    // Wait for error to appear
    await page.waitForTimeout(2000);

    // Check what error messages appear
    const errorElements = await page.locator(".text-red-200").all();
    console.log(`Found ${errorElements.length} error elements`);
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log("Error text:", JSON.stringify(text));
    }

    // Look for any error text on the page
    const pageText = await page.textContent("body");
    console.log("Page contains 'Invalid credentials':", pageText?.includes("Invalid credentials"));

    // Verify error handling
    await expect(page.locator(".text-red-200").filter({ hasText: "Invalid credentials" })).toBeVisible();
  });
});
