import { Page, Locator } from "@playwright/test";

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

  async selectVehicle(licensePlate: string) {
    await this.vehicleSelect.click();
    await this.page.locator(`[value="${licensePlate}"]`).click();
  }

  async selectFirstVehicle() {
    await this.vehicleSelect.click();
    // Select the first available option (excluding placeholder)
    const firstOption = this.page.locator("select option").nth(1);
    const licensePlate = await firstOption.getAttribute("value");
    if (licensePlate) {
      await this.page.locator(`[value="${licensePlate}"]`).click();
    }
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
    await this.vehicleSelect.waitFor({ state: "visible" });
    await this.confirmReservationButton.waitFor({ state: "visible" });
    await this.serviceDetails.waitFor({ state: "visible" });
    await this.appointmentDetails.waitFor({ state: "visible" });
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
