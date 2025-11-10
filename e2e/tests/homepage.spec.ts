import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Homepage', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display welcome message', async () => {
    await homePage.expectToBeLoaded();
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should have navigation menu', async ({ page }) => {
    await expect(homePage.navigationMenu).toBeVisible();
    await expect(homePage.vehiclesLink).toBeVisible();
    await expect(homePage.reservationsLink).toBeVisible();
    await expect(homePage.usersLink).toBeVisible();
  });

  test('should navigate to vehicles page', async ({ page }) => {
    await homePage.navigateToVehicles();
    await expect(page).toHaveURL(/.*\/vehicles/);
  });

  test('should navigate to reservations page', async ({ page }) => {
    await homePage.navigateToReservations();
    await expect(page).toHaveURL(/.*\/reservations/);
  });

  test('should navigate to login page', async ({ page }) => {
    await homePage.navigateToLogin();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    
    await expect(homePage.navigationMenu).toBeVisible();
    // Check if mobile menu is working correctly
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Garage Pro/);
  });

  test('should take screenshot for visual regression', async ({ page }) => {
    await homePage.expectToBeLoaded();
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('homepage.png');
  });
});
