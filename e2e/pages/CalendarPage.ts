import { Page, Locator } from '@playwright/test';

export class CalendarPage {
  readonly page: Page;
  readonly dayMonday: Locator;
  readonly dayTuesday: Locator;
  readonly dayWednesday: Locator;
  readonly dayThursday: Locator;
  readonly dayFriday: Locator;
  readonly daySaturday: Locator;
  readonly daySunday: Locator;
  readonly previousWeekButton: Locator;
  readonly nextWeekButton: Locator;
  readonly todayButton: Locator;
  readonly timeSlot0: Locator; // First available time slot
  readonly timeSlot1: Locator; // Second available time slot
  readonly timeSlot2: Locator; // Third available time slot
  readonly backButton: Locator;
  readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dayMonday = page.locator('[data-test-id="day-pon"]');
    this.dayTuesday = page.locator('[data-test-id="day-wt"]');
    this.dayWednesday = page.locator('[data-test-id="day-śr"]');
    this.dayThursday = page.locator('[data-test-id="day-czw"]');
    this.dayFriday = page.locator('[data-test-id="day-pt"]');
    this.daySaturday = page.locator('[data-test-id="day-sob"]');
    this.daySunday = page.locator('[data-test-id="day-nie"]');
    this.previousWeekButton = page.locator('button:has([data-testid="chevron-left"])');
    this.nextWeekButton = page.locator('button:has([data-testid="chevron-right"])');
    this.todayButton = page.locator('button:has-text("Dzisiaj")');
    this.timeSlot0 = page.locator('[data-test-id="time-slot-0"]');
    this.timeSlot1 = page.locator('[data-test-id="time-slot-1"]');
    this.timeSlot2 = page.locator('[data-test-id="time-slot-2"]');
    this.backButton = page.locator('button:has-text("Zmień usługę")');
    this.emptyStateMessage = page.locator('text=Brak dostępnych terminów');
  }

  async selectDay(dayName: string) {
    const dayLocator = page.locator(`[data-test-id="day-${dayName}"]`);
    await dayLocator.click();
  }

  async selectFriday() {
    await this.dayFriday.click();
  }

  async selectTimeSlot(slotIndex: number = 0) {
    const timeSlotLocator = page.locator(`[data-test-id="time-slot-${slotIndex}"]`);
    await timeSlotLocator.click();
  }

  async selectFirstTimeSlot() {
    await this.timeSlot0.click();
  }

  async goToPreviousWeek() {
    await this.previousWeekButton.click();
  }

  async goToNextWeek() {
    await this.nextWeekButton.click();
  }

  async goToToday() {
    await this.todayButton.click();
  }

  async goBackToServiceSelection() {
    await this.backButton.click();
  }

  async expectToBeLoaded() {
    await this.dayMonday.waitFor({ state: 'visible' });
    await this.backButton.waitFor({ state: 'visible' });
  }

  async expectTimeSlotsVisible() {
    await this.timeSlot0.waitFor({ state: 'visible' });
  }

  async expectEmptyState() {
    await this.emptyStateMessage.waitFor({ state: 'visible' });
  }
}

