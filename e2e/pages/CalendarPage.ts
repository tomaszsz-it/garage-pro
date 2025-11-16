import type { Page, Locator } from "@playwright/test";

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
    const dayLocator = this.page.locator(`[data-test-id="day-${dayName}"]`);
    await dayLocator.click();
  }

  async selectFriday() {
    await this.dayFriday.click();
  }

  async selectTimeSlot(slotIndex = 0) {
    const timeSlotLocator = this.page.locator(`[data-test-id="time-slot-${slotIndex}"]`);
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
   * Iterates through days of the week, then navigates to next week if no slots found.
   * @param maxWeeks Maximum number of weeks to search (default: 8)
   * @returns true if an available day was found and selected, false otherwise
   */
  async selectFirstAvailableDay(maxWeeks = 8): Promise<boolean> {
    const dayTestIds = ["day-pon", "day-wt", "day-śr", "day-czw", "day-pt", "day-sob", "day-nie"];

    for (let week = 0; week < maxWeeks; week++) {
      // Wait for calendar to load
      await this.dayMonday.waitFor({ state: "visible", timeout: 10000 }).catch(() => false);

      // Wait a bit for slots to load after week navigation
      await this.page.waitForTimeout(500);

      // Try each day in the current week
      for (const dayTestId of dayTestIds) {
        const dayLocator = this.page.locator(`[data-test-id="${dayTestId}"]`);

        // Check if day is visible
        const isVisible = await dayLocator.isVisible().catch(() => false);
        if (!isVisible) {
          continue;
        }

        // Check if day is disabled (past or no slots)
        const isDisabled = await dayLocator.getAttribute("aria-disabled");
        if (isDisabled === "true") {
          continue;
        }

        // Click the available day
        await dayLocator.click();

        // Wait for UI update and check for time slots
        await this.page.waitForTimeout(500);
        const hasTimeSlots = await this.timeSlot0.isVisible().catch(() => false);

        if (hasTimeSlots) {
          return true; // Found available day with slots
        }
      }

      // No available days in this week, navigate to next week if possible
      if (week < maxWeeks - 1) {
        const canNavigateNext = await this.nextWeekButton.isVisible().catch(() => false);
        if (!canNavigateNext) {
          return false;
        }

        const isNextDisabled = await this.nextWeekButton.isDisabled().catch(() => true);
        if (isNextDisabled) {
          return false;
        }

        await this.nextWeekButton.click();
        await this.page.waitForTimeout(500); // Wait for week transition and data loading
      }
    }

    return false; // No available slots found after searching all weeks
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
