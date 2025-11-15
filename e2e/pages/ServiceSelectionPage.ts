import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

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

  /**
   * Selects the oil change service (service ID 1).
   * Waits for React state update before proceeding.
   */
  async selectOilChangeService() {
    // Wait for component to be interactive (React hydrated)
    await this.page.waitForTimeout(500);
    
    // Click the radio input directly to trigger React onChange
    const radioInput = this.page.locator('input[type="radio"][value="1"]');
    await radioInput.waitFor({ state: "visible" });
    await radioInput.click({ force: true });
    
    // Wait for React to update state and enable the submit button
    await expect(this.submitButton).toBeEnabled({ timeout: 5000 });
  }

  async submitServiceSelection() {
    // Wait for button to be enabled before clicking
    await expect(this.submitButton).toBeEnabled({ timeout: 5000 });
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

  async expectSubmitButtonDisabled() {
    await this.submitButton.waitFor({ state: "visible" });
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled() {
    await expect(this.submitButton).toBeEnabled({ timeout: 5000 });
  }
}
