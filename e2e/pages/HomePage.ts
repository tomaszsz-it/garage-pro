import { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly welcomeTitle: Locator;
  readonly navigationMenu: Locator;
  readonly vehiclesLink: Locator;
  readonly reservationsLink: Locator;
  readonly usersLink: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeTitle = page.locator('h1:has-text("Welcome")');
    this.navigationMenu = page.locator('nav[role="navigation"]');
    this.vehiclesLink = page.locator('a[href="/vehicles"]');
    this.reservationsLink = page.locator('a[href="/reservations"]');
    this.usersLink = page.locator('a[href="/users"]');
    this.loginButton = page.locator('a[href="/auth/login"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async navigateToVehicles() {
    await this.vehiclesLink.click();
    await this.page.waitForURL("**/vehicles");
  }

  async navigateToReservations() {
    await this.reservationsLink.click();
    await this.page.waitForURL("**/reservations");
  }

  async navigateToUsers() {
    await this.usersLink.click();
    await this.page.waitForURL("**/users");
  }

  async navigateToLogin() {
    await this.loginButton.click();
    await this.page.waitForURL("**/auth/login");
  }

  async expectToBeLoaded() {
    await this.welcomeTitle.waitFor({ state: "visible" });
    await this.navigationMenu.waitFor({ state: "visible" });
  }
}
