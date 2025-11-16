import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Authentication", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, context }) => {
    // Ensure user is logged out before each test
    await context.clearCookies();

    loginPage = new LoginPage(page);
    await loginPage.goto();

    // Wait for React to hydrate by interacting with the form
    await loginPage.emailInput.waitFor({ state: "visible" });
    await loginPage.emailInput.click();
    await page.waitForTimeout(300);
  });

  test("should display login form", async () => {
    await loginPage.expectToBeLoaded();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Disable HTML5 validation to test React validation
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.noValidate = true;
    });

    // Click submit with empty fields to trigger React validation
    await loginPage.loginButton.click();

    // Wait for React to render validation errors
    await page.waitForTimeout(500);

    // Check for React validation error messages (both fields required)
    await expect(page.getByText("Adres e-mail jest wymagany", { exact: true })).toBeVisible();
    await expect(page.getByText("Hasło jest wymagane", { exact: true })).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Fill and submit form with invalid credentials
    await loginPage.emailInput.fill("invalid@example.com");
    await loginPage.passwordInput.fill("wrongpassword123");
    await loginPage.loginButton.click();

    // Wait for error to appear
    await page.waitForTimeout(2000);

    // Verify error handling - backend returns this message for invalid credentials
    await expect(page.getByText("Nieprawidłowe dane logowania")).toBeVisible();
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
});
