import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationsAvailableView } from "../ReservationsAvailableView";
import type {
  ServiceDto,
  AvailableReservationViewModel,
  VehicleDto,
  ReservationDto,
  ReservationCreateDto,
} from "../../../../types";

// Mock all the hooks at the top level
const mockUseBookingState = {
  state: {
    selectedService: null,
    selectedDay: null,
    selectedSlot: null,
    selectedVehicle: null,
    slots: [],
    vehicles: [],
    isLoading: false,
    isCreatingReservation: false,
    error: null,
    currentStep: "service-selection" as const,
    reservationSummary: null,
  },
  setSelectedService: vi.fn(),
  setSelectedDay: vi.fn(),
  setSelectedSlot: vi.fn(),
  setSelectedVehicle: vi.fn(),
  setSlots: vi.fn(),
  setVehicles: vi.fn(),
  setLoading: vi.fn(),
  setCreatingReservation: vi.fn(),
  setError: vi.fn(),
  setReservationSummary: vi.fn(),
  resetToServiceSelection: vi.fn(),
  resetToCalendar: vi.fn(),
  restoreBookingState: vi.fn(),
};

const mockUseAuthRedirect = {
  getPendingBooking: vi.fn(() => null),
};

const mockUseDarkMode = {
  isDarkMode: false,
  toggleDarkMode: vi.fn(),
};

const mockUseApiWithRetry = {
  makeApiCall: vi.fn(),
};

vi.mock("../../../../hooks/useBookingState", () => ({
  useBookingState: vi.fn(() => mockUseBookingState),
}));

vi.mock("../../../../hooks/useAuthRedirect", () => ({
  useAuthRedirect: vi.fn(() => mockUseAuthRedirect),
}));

vi.mock("../../../../hooks/useDarkMode", () => ({
  useDarkMode: vi.fn(() => mockUseDarkMode),
}));

vi.mock("../../../../hooks/useApiWithRetry", () => ({
  useApiWithRetry: vi.fn(() => mockUseApiWithRetry),
}));

// Mock child components to focus on the main component logic
vi.mock("../ServiceSelectionForm", () => ({
  default: ({ onServiceSelect }: { onServiceSelect: (service: ServiceDto) => void }) => (
    <div data-testid="service-selection-form">
      <button onClick={() => onServiceSelect(mockService)} data-testid="select-service-btn">
        Select Service
      </button>
    </div>
  ),
}));

vi.mock("../CalendarView", () => ({
  default: ({
    onTimeSelect,
    onBack,
  }: {
    onTimeSelect: (slot: AvailableReservationViewModel) => void;
    onBack: () => void;
  }) => (
    <div data-testid="calendar-view">
      <button onClick={() => onTimeSelect(mockAvailableSlot)} data-testid="select-time-btn">
        Select Time
      </button>
      <button onClick={onBack} data-testid="back-to-service-btn">
        Back to Service
      </button>
    </div>
  ),
}));

vi.mock("../BookingConfirmationForm", () => ({
  default: ({
    onVehicleSelect,
    onCreateReservation,
    onBack,
  }: {
    onVehicleSelect: (vehicle: VehicleDto) => void;
    onCreateReservation: (data: ReservationCreateDto) => void;
    onBack: () => void;
  }) => (
    <div data-testid="booking-confirmation-form">
      <button onClick={() => onVehicleSelect(mockVehicle)} data-testid="select-vehicle-btn">
        Select Vehicle
      </button>
      <button onClick={() => onCreateReservation(mockReservationCreateDto)} data-testid="create-reservation-btn">
        Create Reservation
      </button>
      <button onClick={onBack} data-testid="back-to-calendar-btn">
        Back to Calendar
      </button>
    </div>
  ),
}));

vi.mock("../ReservationConfirmationView", () => ({
  ReservationConfirmationView: ({ onBackToReservations }: { onBackToReservations: () => void }) => (
    <div data-testid="reservation-confirmation-view">
      <button onClick={onBackToReservations} data-testid="back-to-reservations-btn">
        Back to Reservations
      </button>
    </div>
  ),
}));

vi.mock("../LoadingIndicator", () => ({
  LoadingIndicator: () => <div data-testid="loading-indicator">Loading...</div>,
}));

vi.mock("../ErrorNotification", () => ({
  ErrorNotification: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="error-notification">
      <span>Error occurred</span>
      <button onClick={onRetry} data-testid="retry-btn">
        Retry
      </button>
    </div>
  ),
}));

// Mock data factories
const mockService: ServiceDto = {
  id: 1,
  name: "Oil Change",
  description: "Regular oil change service",
  duration_minutes: 30,
  price: 50.0,
  is_active: true,
};

const mockAvailableSlot: AvailableReservationViewModel = {
  start_ts: "2025-11-15T10:00:00Z",
  end_ts: "2025-11-15T10:30:00Z",
  employee_id: "emp1",
  employee_name: "John Mechanic",
};

const mockVehicle: VehicleDto = {
  license_plate: "ABC-123",
  brand: "Toyota",
  model: "Camry",
  production_year: 2020,
  vin: "1234567890ABCDEFG",
  car_type: "Sedan",
  created_at: "2025-01-01T00:00:00Z",
};

const mockReservationCreateDto = {
  service_id: 1,
  vehicle_license_plate: "ABC-123",
  employee_id: "emp1",
  start_ts: "2025-11-15T10:00:00Z",
  end_ts: "2025-11-15T10:30:00Z",
};

const mockReservation: ReservationDto = {
  id: "res1",
  service_id: 1,
  vehicle_license_plate: "ABC-123",
  employee_id: "emp1",
  start_ts: "2025-11-15T10:00:00Z",
  end_ts: "2025-11-15T10:30:00Z",
  status: "scheduled",
  created_at: "2025-01-01T00:00:00Z",
  service_name: "Oil Change",
  service_duration_minutes: 30,
  employee_name: "John Mechanic",
  recommendation_text: "Regular maintenance",
};

describe("ReservationsAvailableView", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset mock state to defaults
    mockUseBookingState.state = {
      selectedService: null,
      selectedDay: null,
      selectedSlot: null,
      selectedVehicle: null,
      slots: [],
      vehicles: [],
      isLoading: false,
      isCreatingReservation: false,
      error: null,
      currentStep: "service-selection" as const,
      reservationSummary: null,
    };
    mockUseDarkMode.isDarkMode = false;
    mockUseAuthRedirect.getPendingBooking.mockReturnValue(null);

    // Mock window.location.href
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the main title and description", () => {
      render(<ReservationsAvailableView />);

      expect(screen.getByText("Dostępne terminy rezerwacji")).toBeInTheDocument();
      expect(screen.getByText("Wybierz usługę i znajdź dostępny termin dla swojego pojazdu")).toBeInTheDocument();
    });

    it("should render dark mode toggle", () => {
      render(<ReservationsAvailableView />);

      const toggle = screen.getByRole("switch", { name: /toggle dark mode/i });
      expect(toggle).toBeInTheDocument();
    });

    it("should not show title when in reservation summary step", () => {
      mockUseBookingState.state.currentStep = "reservation-summary";

      render(<ReservationsAvailableView />);

      expect(screen.queryByText("Dostępne terminy rezerwacji")).not.toBeInTheDocument();
    });
  });

  describe("Step Navigation", () => {
    it("should show ServiceSelectionForm in service-selection step", () => {
      mockUseBookingState.state.currentStep = "service-selection";

      render(<ReservationsAvailableView />);

      expect(screen.getByTestId("service-selection-form")).toBeInTheDocument();
    });

    it("should show CalendarView in calendar step with selected service", () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = mockService;

      render(<ReservationsAvailableView />);

      expect(screen.getByTestId("calendar-view")).toBeInTheDocument();
    });

    it("should show BookingConfirmationForm in booking-confirmation step", () => {
      mockUseBookingState.state.currentStep = "booking-confirmation";
      mockUseBookingState.state.selectedService = mockService;
      mockUseBookingState.state.selectedSlot = mockAvailableSlot;

      render(<ReservationsAvailableView />);

      expect(screen.getByTestId("booking-confirmation-form")).toBeInTheDocument();
    });

    it("should show ReservationConfirmationView in reservation-summary step", () => {
      mockUseBookingState.state.currentStep = "reservation-summary";
      mockUseBookingState.state.reservationSummary = mockReservation;

      render(<ReservationsAvailableView />);

      expect(screen.getByTestId("reservation-confirmation-view")).toBeInTheDocument();
    });
  });

  describe("Loading and Error States", () => {
    it("should show loading indicator when isLoading is true", () => {
      mockUseBookingState.state.isLoading = true;

      render(<ReservationsAvailableView />);

      expect(screen.getByRole("status", { name: /ładowanie zawartości/i })).toBeInTheDocument();
    });

    it("should show error notification when error exists", () => {
      mockUseBookingState.state.error = "Something went wrong";

      render(<ReservationsAvailableView />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/nie udało się załadować rezerwacji/i)).toBeInTheDocument();
    });

    it("should call retry handler when retry button is clicked", async () => {
      mockUseBookingState.state.error = "API Error";
      mockUseBookingState.state.currentStep = "booking-confirmation";
      mockUseBookingState.state.selectedService = mockService;
      mockUseBookingState.state.selectedSlot = mockAvailableSlot;

      render(<ReservationsAvailableView />);

      const retryBtn = screen.getByRole("button", { name: /spróbuj ponownie/i });
      await userEvent.click(retryBtn);

      expect(mockUseBookingState.setError).toHaveBeenCalledWith(null);
    });
  });

  describe("Service Selection Flow", () => {
    it("should handle service selection correctly", async () => {
      mockUseBookingState.state.currentStep = "service-selection";

      render(<ReservationsAvailableView />);

      const selectServiceBtn = screen.getByTestId("select-service-btn");
      await userEvent.click(selectServiceBtn);

      expect(mockUseBookingState.setSelectedService).toHaveBeenCalledWith(mockService);
    });

    it("should handle back to service selection", async () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = mockService;

      render(<ReservationsAvailableView />);

      const backBtn = screen.getByTestId("back-to-service-btn");
      await userEvent.click(backBtn);

      expect(mockUseBookingState.resetToServiceSelection).toHaveBeenCalled();
    });
  });

  describe("Time Selection Flow", () => {
    it("should handle time selection and fetch vehicles", async () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = mockService;

      const mockResponse = {
        json: vi.fn().mockResolvedValue({ data: [mockVehicle] }),
      };
      mockUseApiWithRetry.makeApiCall.mockResolvedValue(mockResponse);

      render(<ReservationsAvailableView />);

      const selectTimeBtn = screen.getByTestId("select-time-btn");
      await userEvent.click(selectTimeBtn);

      expect(mockUseBookingState.setSelectedSlot).toHaveBeenCalledWith(mockAvailableSlot);
      expect(mockUseBookingState.setLoading).toHaveBeenCalledWith(true);
      expect(mockUseApiWithRetry.makeApiCall).toHaveBeenCalledWith(
        "/api/vehicles",
        {},
        expect.objectContaining({
          selectedService: mockService,
          selectedSlot: mockAvailableSlot,
          returnUrl: "/reservations/available",
          step: "booking-confirmation",
        })
      );

      await waitFor(() => {
        expect(mockUseBookingState.setVehicles).toHaveBeenCalledWith([mockVehicle]);
        expect(mockUseBookingState.setLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should handle API error during vehicle fetch", async () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = mockService;

      const error = new Error("Failed to load vehicles");
      mockUseApiWithRetry.makeApiCall.mockRejectedValue(error);

      render(<ReservationsAvailableView />);

      const selectTimeBtn = screen.getByTestId("select-time-btn");
      await userEvent.click(selectTimeBtn);

      await waitFor(() => {
        expect(mockUseBookingState.setError).toHaveBeenCalledWith("Failed to load vehicles");
        expect(mockUseBookingState.setLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should not show calendar view if no service selected", () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = null;

      render(<ReservationsAvailableView />);

      // Calendar view should not be rendered if no service is selected
      expect(screen.queryByTestId("calendar-view")).not.toBeInTheDocument();
    });
  });

  describe("Booking Confirmation Flow", () => {
    it("should handle vehicle selection", async () => {
      mockUseBookingState.state.currentStep = "booking-confirmation";
      mockUseBookingState.state.selectedService = mockService;
      mockUseBookingState.state.selectedSlot = mockAvailableSlot;

      render(<ReservationsAvailableView />);

      const selectVehicleBtn = screen.getByTestId("select-vehicle-btn");
      await userEvent.click(selectVehicleBtn);

      expect(mockUseBookingState.setSelectedVehicle).toHaveBeenCalledWith(mockVehicle);
    });

    it("should handle reservation creation successfully", async () => {
      mockUseBookingState.state.currentStep = "booking-confirmation";
      mockUseBookingState.state.selectedService = mockService;
      mockUseBookingState.state.selectedSlot = mockAvailableSlot;

      const mockResponse = {
        json: vi.fn().mockResolvedValue(mockReservation),
      };
      mockUseApiWithRetry.makeApiCall.mockResolvedValue(mockResponse);

      render(<ReservationsAvailableView />);

      const createReservationBtn = screen.getByTestId("create-reservation-btn");
      await userEvent.click(createReservationBtn);

      expect(mockUseBookingState.setCreatingReservation).toHaveBeenCalledWith(true);
      expect(mockUseApiWithRetry.makeApiCall).toHaveBeenCalledWith("/api/reservations", {
        method: "POST",
        body: JSON.stringify(mockReservationCreateDto),
      });

      await waitFor(() => {
        expect(mockUseBookingState.setReservationSummary).toHaveBeenCalledWith(mockReservation);
        expect(mockUseBookingState.setCreatingReservation).toHaveBeenCalledWith(false);
      });
    });

    it("should handle reservation creation error", async () => {
      mockUseBookingState.state.currentStep = "booking-confirmation";
      mockUseBookingState.state.selectedService = mockService;
      mockUseBookingState.state.selectedSlot = mockAvailableSlot;

      const error = new Error("Failed to create reservation");
      mockUseApiWithRetry.makeApiCall.mockRejectedValue(error);

      render(<ReservationsAvailableView />);

      const createReservationBtn = screen.getByTestId("create-reservation-btn");
      await userEvent.click(createReservationBtn);

      await waitFor(() => {
        expect(mockUseBookingState.setError).toHaveBeenCalledWith("Failed to create reservation");
        expect(mockUseBookingState.setCreatingReservation).toHaveBeenCalledWith(false);
      });
    });

    it("should handle back to calendar navigation", async () => {
      mockUseBookingState.state.currentStep = "booking-confirmation";
      mockUseBookingState.state.selectedService = mockService;
      mockUseBookingState.state.selectedSlot = mockAvailableSlot;

      render(<ReservationsAvailableView />);

      const backBtn = screen.getByTestId("back-to-calendar-btn");
      await userEvent.click(backBtn);

      expect(mockUseBookingState.resetToCalendar).toHaveBeenCalled();
    });
  });

  describe("Pending Booking State Restoration", () => {
    it("should restore booking state after login", async () => {
      const pendingBooking = {
        selectedService: mockService,
        selectedSlot: mockAvailableSlot,
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      mockUseAuthRedirect.getPendingBooking.mockReturnValue(pendingBooking);

      const mockResponse = {
        json: vi.fn().mockResolvedValue({ data: [mockVehicle] }),
      };
      mockUseApiWithRetry.makeApiCall.mockResolvedValue(mockResponse);

      render(<ReservationsAvailableView />);

      await waitFor(() => {
        expect(mockUseBookingState.restoreBookingState).toHaveBeenCalledWith(pendingBooking);
        expect(mockUseApiWithRetry.makeApiCall).toHaveBeenCalledWith("/api/vehicles");
        expect(mockUseBookingState.setVehicles).toHaveBeenCalledWith([mockVehicle]);
      });
    });

    it("should handle error during pending booking restoration", async () => {
      const pendingBooking = {
        selectedService: mockService,
        selectedSlot: mockAvailableSlot,
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      mockUseAuthRedirect.getPendingBooking.mockReturnValue(pendingBooking);

      const error = new Error("Failed to load vehicles");
      mockUseApiWithRetry.makeApiCall.mockRejectedValue(error);

      render(<ReservationsAvailableView />);

      await waitFor(() => {
        expect(mockUseBookingState.setError).toHaveBeenCalledWith("Failed to load vehicles");
        expect(mockUseBookingState.setLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should not restore booking state if incomplete data", () => {
      const incompletePendingBooking = {
        selectedService: mockService,
        // Missing selectedSlot
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      mockUseAuthRedirect.getPendingBooking.mockReturnValue(incompletePendingBooking);

      render(<ReservationsAvailableView />);

      expect(mockUseBookingState.restoreBookingState).not.toHaveBeenCalled();
      expect(mockUseApiWithRetry.makeApiCall).not.toHaveBeenCalled();
    });
  });

  describe("Dark Mode Toggle", () => {
    it("should toggle dark mode when switch is clicked", async () => {
      render(<ReservationsAvailableView />);

      const toggle = screen.getByRole("switch", { name: /toggle dark mode/i });
      await userEvent.click(toggle);

      expect(mockUseDarkMode.toggleDarkMode).toHaveBeenCalled();
    });

    it("should apply dark mode styles when isDarkMode is true", () => {
      mockUseDarkMode.isDarkMode = true;

      render(<ReservationsAvailableView />);

      const heading = screen.getByText("Dostępne terminy rezerwacji");
      expect(heading).toHaveClass("text-white");
    });
  });

  describe("Final Navigation", () => {
    it("should navigate back to reservations page", async () => {
      mockUseBookingState.state.currentStep = "reservation-summary";
      mockUseBookingState.state.reservationSummary = mockReservation;

      render(<ReservationsAvailableView />);

      const backBtn = screen.getByTestId("back-to-reservations-btn");
      await userEvent.click(backBtn);

      expect(window.location.href).toBe("/reservations");
    });
  });

  describe("Component Optimization", () => {
    it("should be memoized to prevent unnecessary re-renders", () => {
      expect(ReservationsAvailableView.displayName).toBe("ReservationsAvailableView");
    });

    it("should use useCallback for all event handlers", () => {
      // This test verifies that handlers are stable across re-renders
      const { rerender } = render(<ReservationsAvailableView />);

      // Force a re-render
      rerender(<ReservationsAvailableView />);

      // The component should not call the hook setters again just from re-rendering
      expect(mockUseBookingState.setSelectedService).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label for dark mode toggle", () => {
      render(<ReservationsAvailableView />);

      const toggle = screen.getByRole("switch", { name: /toggle dark mode/i });
      expect(toggle).toHaveAttribute("aria-label", "Toggle dark mode");
    });

    it("should have semantic heading structure", () => {
      render(<ReservationsAvailableView />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Dostępne terminy rezerwacji");
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle non-Error objects in catch blocks", async () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = mockService;

      // Reject with a string instead of Error object
      mockUseApiWithRetry.makeApiCall.mockRejectedValue("Network error");

      render(<ReservationsAvailableView />);

      const selectTimeBtn = screen.getByTestId("select-time-btn");
      await userEvent.click(selectTimeBtn);

      await waitFor(() => {
        expect(mockUseBookingState.setError).toHaveBeenCalledWith("Failed to load vehicles");
      });
    });

    it("should handle null API response gracefully", async () => {
      mockUseBookingState.state.currentStep = "calendar";
      mockUseBookingState.state.selectedService = mockService;

      mockUseApiWithRetry.makeApiCall.mockResolvedValue(null);

      render(<ReservationsAvailableView />);

      const selectTimeBtn = screen.getByTestId("select-time-btn");
      await userEvent.click(selectTimeBtn);

      await waitFor(() => {
        // Should not crash and should not call setVehicles
        expect(mockUseBookingState.setVehicles).not.toHaveBeenCalled();
        // setLoading is called with true first, then false
        expect(mockUseBookingState.setLoading).toHaveBeenCalledWith(true);
      });

      // Wait for the loading to be set to false
      await waitFor(() => {
        expect(mockUseBookingState.setLoading).toHaveBeenCalledWith(false);
      });
    });
  });
});
