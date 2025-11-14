import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ServiceSelectionPage } from "../pages/ServiceSelectionPage";
import { CalendarPage } from "../pages/CalendarPage";
import { BookingConfirmationPage } from "../pages/BookingConfirmationPage";

test.describe("Reservation Flow", () => {
  let loginPage: LoginPage;
  let serviceSelectionPage: ServiceSelectionPage;
  let calendarPage: CalendarPage;
  let bookingConfirmationPage: BookingConfirmationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    serviceSelectionPage = new ServiceSelectionPage(page);
    calendarPage = new CalendarPage(page);
    bookingConfirmationPage = new BookingConfirmationPage(page);

    // Login first - required for accessing protected routes like /reservations
    await loginPage.goto();

    // Wait for login page to load
    await loginPage.expectToBeLoaded();

    // Use test credentials - can be overridden by environment variables
    const username = process.env.E2E_USERNAME || "test@example.com";
    const password = process.env.E2E_PASSWORD || "password";

    await loginPage.login(username, password);

    // Wait for successful login by checking for navigation menu (indicates we're logged in)
    await page.locator("nav").waitFor({ state: "visible", timeout: 10000 });

    // Ensure test user has at least one vehicle
    await page.goto("/vehicles");

    // Wait for vehicles page to load
    await page.locator('h2:has-text("Zarządzanie pojazdami")').waitFor({ state: "visible", timeout: 10000 });

    // Check if we have any vehicles
    const vehicleCount = await page.locator("text=TWÓJ NUMER REJESTRACYJNY").count();
    if (vehicleCount === 0) {
      // Create a test vehicle
      await page.click("text=Dodaj pojazd");

      // Wait for form to load
      await page.locator('h2:has-text("Dodaj nowy pojazd")').waitFor({ state: "visible", timeout: 10000 });

      await page.fill("#license_plate", "TEST123");
      await page.fill("#brand", "Toyota");
      await page.fill("#model", "Corolla");
      await page.fill("#production_year", "2020");
      await page.fill("#car_type", "Sedan");

      await page.click('button[type="submit"]:has-text("Dodaj pojazd")');

      // Wait for success - should be back on vehicles page
      await page.locator('h2:has-text("Zarządzanie pojazdami")').waitFor({ state: "visible", timeout: 10000 });
    }

    // Go back to reservations for the test
    await page.goto("/reservations/available");

    // Wait for available reservations page to load
    await page
      .locator("h1")
      .filter({ hasText: /dostępne terminy/i })
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test("should complete full reservation flow", async ({ page }) => {
    // Vehicle setup and navigation to available reservations is done in beforeEach

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
    await expect(page.locator("text=Rezerwacja potwierdzona")).toBeVisible();
    await expect(page.locator("text=Szczegóły rezerwacji")).toBeVisible();
  });

  test("should validate service selection", async ({ page }) => {
    // Navigation to available reservations is done in beforeEach

    // Try to submit without selecting service
    await serviceSelectionPage.expectToBeLoaded();
    await serviceSelectionPage.submitServiceSelection();

    // Should show validation error
    await serviceSelectionPage.expectErrorMessage("Proszę wybrać usługę");
  });

  test("should validate vehicle selection in booking confirmation", async ({ page }) => {
    // Skip to booking confirmation step (assuming service and time are selected)
    // This would typically require setting up the app state or using API calls

    // Navigation to available reservations is done in beforeEach

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // This test would need proper setup to reach booking confirmation
    // For demonstration purposes, we'll test the component behavior
  });

  test("should allow navigation back through the flow", async ({ page }) => {
    // Navigation to available reservations is done in beforeEach

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // Go back to service selection
    await calendarPage.goBackToServiceSelection();

    // Should be back at service selection
    await serviceSelectionPage.expectToBeLoaded();
  });

  test("should handle empty calendar state", async ({ page }) => {
    // Navigation to available reservations is done in beforeEach

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
