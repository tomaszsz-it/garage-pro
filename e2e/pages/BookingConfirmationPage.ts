import type { Page, Locator } from "@playwright/test";

export class BookingConfirmationPage {
  readonly page: Page;
  readonly vehicleSelect: Locator;
  readonly confirmReservationButton: Locator;
  readonly cancelButton: Locator;
  readonly backToCalendarButton: Locator;
  readonly selectedVehicleInfo: Locator;
  readonly serviceDetails: Locator;
  readonly appointmentDetails: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.vehicleSelect = page.locator('[data-test-id="vehicle-select"]');
    this.confirmReservationButton = page.locator('[data-test-id="confirm-reservation"]');
    this.cancelButton = page.locator('button:has-text("Anuluj")');
    this.backToCalendarButton = page.locator('button:has-text("Wróć do kalendarza")');
    this.selectedVehicleInfo = page.locator("text=Wybrany pojazd:");
    this.serviceDetails = page.locator("text=Szczegóły usługi");
    this.appointmentDetails = page.locator("text=Szczegóły terminu");
    this.validationError = page.locator(".text-red-600");
  }

  /**
   * Selects a vehicle by license plate from the Radix UI Select dropdown.
   * @param licensePlate The vehicle license plate to select
   */
  async selectVehicle(licensePlate: string) {
    // Click trigger to open dropdown
    await this.vehicleSelect.click();

    // Wait for dropdown animation and click the matching option
    await this.page.waitForTimeout(200);
    const option = this.page.locator(`[role="option"][data-value="${licensePlate}"]`);
    await option.click();
  }

  /**
   * Selects the first available vehicle from the Radix UI Select dropdown.
   */
  async selectFirstVehicle() {
    // Click trigger to open dropdown
    await this.vehicleSelect.click();

    // Wait for dropdown animation and select first option
    await this.page.waitForTimeout(200);
    const firstOption = this.page.locator('[role="option"]').first();
    await firstOption.click();
  }

  async confirmReservation() {
    await this.confirmReservationButton.click();
  }

  async cancelReservation() {
    await this.cancelButton.click();
  }

  async goBackToCalendar() {
    await this.backToCalendarButton.click();
  }

  async expectToBeLoaded() {
    // Wait for main components to be visible first
    await this.serviceDetails.waitFor({ state: "visible", timeout: 15000 });
    await this.appointmentDetails.waitFor({ state: "visible", timeout: 15000 });
    await this.confirmReservationButton.waitFor({ state: "visible", timeout: 15000 });

    // Vehicle select may take longer to appear as vehicles are loaded async
    await this.vehicleSelect.waitFor({ state: "visible", timeout: 20000 });
  }

  async expectVehicleSelected(licensePlate: string) {
    await this.selectedVehicleInfo.waitFor({ state: "visible" });
    await this.page.locator(`text=${licensePlate}`).waitFor({ state: "visible" });
  }

  async expectValidationError(message?: string) {
    await this.validationError.waitFor({ state: "visible" });
    if (message) {
      await this.page.locator(`text=${message}`).waitFor({ state: "visible" });
    }
  }

  async expectNoVehiclesMessage() {
    await this.page.locator("text=Nie masz żadnych pojazdów").waitFor({ state: "visible" });
  }
}
