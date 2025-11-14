import { Page, Locator } from "@playwright/test";

export class ServiceSelectionPage {
  readonly page: Page;
  readonly serviceOption1: Locator; // Wymiana oleju
  readonly serviceOption2: Locator; // Przegląd hamulców
  readonly serviceOption3: Locator; // Wymiana opon
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.serviceOption1 = page.locator('[data-test-id="service-option-1"]');
    this.serviceOption2 = page.locator('[data-test-id="service-option-2"]');
    this.serviceOption3 = page.locator('[data-test-id="service-option-3"]');
    this.submitButton = page.locator('[data-test-id="service-selection-submit"]');
    this.errorMessage = page.locator(".text-red-600");
  }

  async selectService(serviceId: number) {
    const serviceLocator = this.page.locator(`[data-test-id="service-option-${serviceId}"]`);
    await serviceLocator.click();
  }

  async selectOilChangeService() {
    await this.serviceOption1.click();
    // Wait for React to update state and enable the button
    await this.page.waitForTimeout(500);
  }

  async submitServiceSelection() {
    await this.submitButton.click();
  }

  async expectToBeLoaded() {
    await this.serviceOption1.waitFor({ state: "visible" });
    await this.submitButton.waitFor({ state: "visible" });
  }

  async expectErrorMessage(message?: string) {
    await this.errorMessage.waitFor({ state: "visible" });
    if (message) {
      await this.page.locator(`text=${message}`).waitFor({ state: "visible" });
    }
  }
}
