import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form', async () => {
    await loginPage.expectToBeLoaded();
    
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await loginPage.loginButton.click();
    
    // Check for HTML5 validation or custom validation messages
    await expect(loginPage.emailInput).toHaveAttribute('required');
    await expect(loginPage.passwordInput).toHaveAttribute('required');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    // Wait for error message to appear
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.fill('somepassword');
    await loginPage.loginButton.click();
    
    // Check for email validation
    const emailInput = loginPage.emailInput;
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toContain('email');
  });

  test('should have accessible form labels', async ({ page }) => {
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    
    // Check for proper labels or aria-labels
    const emailLabel = page.locator('label[for="email"], [aria-label*="email"]');
    const passwordLabel = page.locator('label[for="password"], [aria-label*="password"]');
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('should have working forgot password link', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);
  });

  test('should have working register link', async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/.*\/auth\/register/);
  });

  // API testing example
  test('should make proper API call on login', async ({ page }) => {
    // Intercept login API call
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      });
    });

    await loginPage.login('test@example.com', 'password');
    
    // Verify error handling
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
