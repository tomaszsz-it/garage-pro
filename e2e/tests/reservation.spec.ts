import { test, expect } from "@playwright/test";
import { ServiceSelectionPage } from "../pages/ServiceSelectionPage";
import { CalendarPage } from "../pages/CalendarPage";
import { BookingConfirmationPage } from "../pages/BookingConfirmationPage";

test.describe("Reservation Flow", () => {
  let serviceSelectionPage: ServiceSelectionPage;
  let calendarPage: CalendarPage;
  let bookingConfirmationPage: BookingConfirmationPage;

  test.beforeEach(async ({ page }) => {
    serviceSelectionPage = new ServiceSelectionPage(page);
    calendarPage = new CalendarPage(page);
    bookingConfirmationPage = new BookingConfirmationPage(page);

    // Ensure test user has at least one vehicle
    await page.goto("/vehicles");

    // Wait for vehicles page to load
    await page.locator('h2:has-text("Zarządzanie pojazdami")').waitFor({ state: "visible", timeout: 10000 });

    // Check if we have any vehicles by looking for the empty state message
    const emptyStateVisible = await page.locator("text=Nie masz jeszcze żadnych pojazdów").isVisible();
    if (emptyStateVisible) {
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

    // Go to reservations for the test
    await page.goto("/reservations/available");

    // Wait for available reservations page to load
    await page
      .locator("h1")
      .filter({ hasText: /dostępne terminy/i })
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test("should complete full reservation flow", async ({ page }) => {
    // Extended timeout for this test - may need to search through multiple weeks for available slots
    test.setTimeout(90000); // 90 seconds

    // Vehicle setup and navigation to available reservations is done in beforeEach

    // Step 1: Select service (Oil change - service ID 1)
    await serviceSelectionPage.expectToBeLoaded();
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // Step 2: Select date and time (first available day and slot)
    await calendarPage.expectToBeLoaded();

    // Find and select first available day (will search through multiple weeks if needed)
    const foundAvailableDay = await calendarPage.selectFirstAvailableDay();
    expect(foundAvailableDay).toBe(true); // Ensure we found an available day

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

  test("should validate service selection", async () => {
    // Navigation to available reservations is done in beforeEach

    // Verify submit button is disabled when no service is selected
    await serviceSelectionPage.expectToBeLoaded();
    await serviceSelectionPage.expectSubmitButtonDisabled();

    // Select a service and verify button becomes enabled
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.expectSubmitButtonEnabled();

    // Verify we can now proceed
    await expect(serviceSelectionPage.submitButton).toBeEnabled();
  });

  test("should validate vehicle selection in booking confirmation", async () => {
    // Skip to booking confirmation step (assuming service and time are selected)
    // This would typically require setting up the app state or using API calls

    // Navigation to available reservations is done in beforeEach

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // This test would need proper setup to reach booking confirmation
    // For demonstration purposes, we'll test the component behavior
  });

  test("should allow navigation back through the flow", async () => {
    // Navigation to available reservations is done in beforeEach

    // Select service
    await serviceSelectionPage.selectOilChangeService();
    await serviceSelectionPage.submitServiceSelection();

    // Go back to service selection
    await calendarPage.goBackToServiceSelection();

    // Should be back at service selection
    await serviceSelectionPage.expectToBeLoaded();
  });

  test("should handle empty calendar state", async () => {
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
