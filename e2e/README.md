# E2E Testing with Playwright

This directory contains end-to-end tests using Playwright with Page Object Model (POM) pattern.

## Page Object Classes

### HomePage
Handles navigation from the home page.
```typescript
const homePage = new HomePage(page);
await homePage.navigateToReservations();
```

### LoginPage
Handles user authentication.
```typescript
const loginPage = new LoginPage(page);
await loginPage.login('user@example.com', 'password');
```

### ServiceSelectionPage
Handles service selection in the reservation flow.
```typescript
const serviceSelectionPage = new ServiceSelectionPage(page);
await serviceSelectionPage.selectOilChangeService(); // Selects "Wymiana oleju"
await serviceSelectionPage.submitServiceSelection();
```

**Available methods:**
- `selectService(serviceId: number)` - Select service by ID
- `selectOilChangeService()` - Select oil change service (ID: 1)
- `submitServiceSelection()` - Submit service selection
- `expectToBeLoaded()` - Wait for page to load
- `expectErrorMessage(message?)` - Check for error messages

### CalendarPage
Handles date and time selection in the reservation flow.
```typescript
const calendarPage = new CalendarPage(page);
await calendarPage.selectFriday(); // Select Friday
await calendarPage.selectFirstTimeSlot(); // Select first available time
```

**Available methods:**
- `selectDay(dayName: string)` - Select day by Polish name (pon, wt, śr, czw, pt, sob, nie)
- `selectFriday()` - Select Friday specifically
- `selectTimeSlot(slotIndex: number)` - Select time slot by index
- `selectFirstTimeSlot()` - Select first available time slot
- `goBackToServiceSelection()` - Navigate back to service selection
- `expectToBeLoaded()` - Wait for page to load
- `expectTimeSlotsVisible()` - Wait for time slots to appear

### BookingConfirmationPage
Handles vehicle selection and reservation confirmation.
```typescript
const bookingConfirmationPage = new BookingConfirmationPage(page);
await bookingConfirmationPage.selectFirstVehicle(); // Select first available vehicle
await bookingConfirmationPage.confirmReservation();
```

**Available methods:**
- `selectVehicle(licensePlate: string)` - Select vehicle by license plate
- `selectFirstVehicle()` - Select first available vehicle
- `confirmReservation()` - Confirm and create reservation
- `goBackToCalendar()` - Navigate back to calendar
- `expectToBeLoaded()` - Wait for page to load
- `expectVehicleSelected(licensePlate)` - Verify vehicle is selected

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test reservation.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests with debugging
npx playwright test --debug
```

## Test Data

The tests use the following data attributes for reliable element selection:
- `data-test-id="service-option-{id}"` - Service selection options
- `data-test-id="service-selection-submit"` - Service selection submit button
- `data-test-id="day-{day}"` - Calendar day selection (pon, wt, śr, czw, pt, sob, nie)
- `data-test-id="time-slot-{index}"` - Time slot selection
- `data-test-id="vehicle-select"` - Vehicle selection dropdown
- `data-test-id="confirm-reservation"` - Reservation confirmation button

## Test Scenarios

### Full Reservation Flow
Tests the complete user journey from service selection to reservation confirmation.

### Validation Tests
Tests form validation and error handling for required fields.

### Navigation Tests
Tests back navigation and flow interruption handling.

### Edge Cases
Tests empty states and error conditions.

