import { Page, Locator } from "@playwright/test";

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
    this.previousWeekButton = page.locator('[data-test-id="previous-week-button"]');
    this.nextWeekButton = page.locator('[data-test-id="next-week-button"]');
    this.todayButton = page.locator('[data-test-id="today-button"]');
    this.timeSlot0 = page.locator('[data-test-id="time-slot-0"]');
    this.timeSlot1 = page.locator('[data-test-id="time-slot-1"]');
    this.timeSlot2 = page.locator('[data-test-id="time-slot-2"]');
    this.backButton = page.locator('button:has-text("Zmień usługę")');
    this.emptyStateMessage = page.locator("text=Brak dostępnych terminów").first();
  }

  async selectDay(dayName: string) {
    const dayLocator = page.locator(`[data-test-id="day-${dayName}"]`);
    await dayLocator.click();
  }

  async selectFriday() {
    await this.dayFriday.click();
  }

  async selectTimeSlot(slotIndex = 0) {
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

  /**
   * Finds and selects the first available day with time slots.
   * Will navigate through next weeks (up to maxWeeks) if no available days in current week.
   * @param maxWeeks Maximum number of weeks to search (default: 4)
   * @returns true if found and selected, false otherwise
   */
  async selectFirstAvailableDay(maxWeeks = 4): Promise<boolean> {
    const dayTestIds = ["day-pon", "day-wt", "day-śr", "day-czw", "day-pt", "day-sob", "day-nie"];

    for (let week = 0; week < maxWeeks; week++) {
      // Wait for at least one day to be visible (calendar loaded)
      await this.dayMonday.waitFor({ state: "visible", timeout: 10000 }).catch(() => false);

      // Try each day in the current week
      for (const dayTestId of dayTestIds) {
        const dayLocator = this.page.locator(`[data-test-id="${dayTestId}"]`);

        // Check if day exists and is visible
        const isVisible = await dayLocator.isVisible().catch(() => false);
        if (!isVisible) continue;

        // Check if day is disabled (aria-disabled="true")
        const isDisabled = await dayLocator.getAttribute("aria-disabled");
        if (isDisabled === "true") continue;

        // Day is available, click it
        await dayLocator.click();

        // Wait for time slots to potentially load
        await this.page.waitForTimeout(500);

        // Check if time slots appeared
        const hasTimeSlots = await this.timeSlot0.isVisible().catch(() => false);

        if (hasTimeSlots) {
          return true; // Success!
        }

        // No time slots for this day, try next day
      }

      // No available days in this week, try next week
      if (week < maxWeeks - 1) {
        const nextButtonVisible = await this.nextWeekButton.isVisible().catch(() => false);
        if (!nextButtonVisible) {
          return false; // Can't go to next week
        }

        const nextButtonDisabled = await this.nextWeekButton.isDisabled().catch(() => true);
        if (nextButtonDisabled) {
          return false; // Can't go to next week
        }

        await this.nextWeekButton.click();

        // Wait for the week to change - calendar should reload
        await this.page.waitForTimeout(500); // Reduced from 1000ms
      }
    }

    return false; // No available days found in any week
  }

  async expectToBeLoaded() {
    await this.dayMonday.waitFor({ state: "visible" });
    await this.backButton.waitFor({ state: "visible" });
  }

  async expectTimeSlotsVisible() {
    await this.timeSlot0.waitFor({ state: "visible" });
  }

  async expectEmptyState() {
    await this.emptyStateMessage.waitFor({ state: "visible" });
  }
}
