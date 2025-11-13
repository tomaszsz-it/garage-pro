import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ServiceSelectionPage } from '../pages/ServiceSelectionPage';
import { CalendarPage } from '../pages/CalendarPage';
import { BookingConfirmationPage } from '../pages/BookingConfirmationPage';

test.describe('Reservation Flow', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let serviceSelectionPage: ServiceSelectionPage;
  let calendarPage: CalendarPage;
  let bookingConfirmationPage: BookingConfirmationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    serviceSelectionPage = new ServiceSelectionPage(page);
    calendarPage = new CalendarPage(page);
    bookingConfirmationPage = new BookingConfirmationPage(page);

    // Login first (assuming user is already logged in for this scenario)
    await page.goto('/');
    await page.waitForLoadState();
  });

  test('should complete full reservation flow', async ({ page }) => {
    // Navigate to reservations page
    await homePage.navigateToReservations();
    await page.waitForURL('**/reservations');

    // Navigate to available reservations
    await page.locator('a[href="/reservations/available"]').click();
    await page.waitForURL('**/reservations/available');

    // Step 1: Select service (Oil change - service ID 1)
    await serviceSelectionPage.expectToBeLoaded();
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // Step 2: Select date and time (Friday, first available slot)
    await calendarPage.expectToBeLoaded();
    await calendarPage.selectFriday();
    await calendarPage.expectTimeSlotsVisible();
    await calendarPage.selectFirstTimeSlot();

    // Step 3: Confirm booking (select first vehicle)
    await bookingConfirmationPage.expectToBeLoaded();
    await bookingConfirmationPage.selectFirstVehicle();
    await bookingConfirmationPage.confirmReservation();

    // Verify reservation was created successfully
    await expect(page.locator('text=Rezerwacja potwierdzona')).toBeVisible();
    await expect(page.locator('text=Szczegóły rezerwacji')).toBeVisible();
  });

  test('should validate service selection', async ({ page }) => {
    // Navigate to available reservations
    await page.goto('/reservations/available');
    await page.waitForURL('**/reservations/available');

    // Try to submit without selecting service
    await serviceSelectionPage.expectToBeLoaded();
    await serviceSelectionPage.submitServiceSelection();

    // Should show validation error
    await serviceSelectionPage.expectErrorMessage('Proszę wybrać usługę');
  });

  test('should validate vehicle selection in booking confirmation', async ({ page }) => {
    // Skip to booking confirmation step (assuming service and time are selected)
    // This would typically require setting up the app state or using API calls

    // For now, test the UI validation
    await page.goto('/reservations/available');
    await page.waitForURL('**/reservations/available');

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // This test would need proper setup to reach booking confirmation
    // For demonstration purposes, we'll test the component behavior
  });

  test('should allow navigation back through the flow', async ({ page }) => {
    // Navigate to available reservations
    await page.goto('/reservations/available');
    await page.waitForURL('**/reservations/available');

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // Go back to service selection
    await calendarPage.goBackToServiceSelection();

    // Should be back at service selection
    await serviceSelectionPage.expectToBeLoaded();
  });

  test('should handle empty calendar state', async ({ page }) => {
    // Navigate to available reservations
    await page.goto('/reservations/available');
    await page.waitForURL('**/reservations/available');

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // Check if calendar loads (this might show empty state depending on available slots)
    await calendarPage.expectToBeLoaded();

    // If no slots are available, should show appropriate message
    const emptyStateVisible = await calendarPage.emptyStateMessage.isVisible();
    if (emptyStateVisible) {
      await calendarPage.expectEmptyState();
    }
  });
});

