import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBookingState } from "../useBookingState";
import type { ServiceDto, AvailableReservationViewModel, VehicleDto, ReservationDto } from "../../types";

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

describe("useBookingState", () => {
  let hookResult: ReturnType<typeof useBookingState>;

  beforeEach(() => {
    const { result } = renderHook(() => useBookingState());
    hookResult = result.current;
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      expect(hookResult.state).toMatchInlineSnapshot(`
        {
          "currentStep": "service-selection",
          "error": null,
          "isCreatingReservation": false,
          "isLoading": false,
          "reservationSummary": null,
          "selectedDay": null,
          "selectedService": null,
          "selectedSlot": null,
          "selectedVehicle": null,
          "slots": [],
          "vehicles": [],
        }
      `);
    });

    it("should start with service-selection step", () => {
      expect(hookResult.state.currentStep).toBe("service-selection");
    });

    it("should have no selected items initially", () => {
      expect(hookResult.state.selectedService).toBeNull();
      expect(hookResult.state.selectedDay).toBeNull();
      expect(hookResult.state.selectedSlot).toBeNull();
      expect(hookResult.state.selectedVehicle).toBeNull();
    });

    it("should have empty arrays for slots and vehicles", () => {
      expect(hookResult.state.slots).toEqual([]);
      expect(hookResult.state.vehicles).toEqual([]);
    });

    it("should have loading states as false initially", () => {
      expect(hookResult.state.isLoading).toBe(false);
      expect(hookResult.state.isCreatingReservation).toBe(false);
    });
  });

  describe("Service Selection", () => {
    it("should set selected service and advance to calendar step", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedService(mockService);
      });

      expect(result.current.state.selectedService).toEqual(mockService);
      expect(result.current.state.currentStep).toBe("calendar");
      expect(result.current.state.error).toBeNull();
    });

    it("should reset to service-selection step when service is null", () => {
      const { result } = renderHook(() => useBookingState());

      // First set a service
      act(() => {
        result.current.setSelectedService(mockService);
      });

      // Then set to null
      act(() => {
        result.current.setSelectedService(null);
      });

      expect(result.current.state.selectedService).toBeNull();
      expect(result.current.state.currentStep).toBe("service-selection");
    });

    it("should clear error when setting service", () => {
      const { result } = renderHook(() => useBookingState());

      // Set an error first
      act(() => {
        result.current.setError("Some error");
      });

      // Then set service
      act(() => {
        result.current.setSelectedService(mockService);
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe("Day and Slot Selection", () => {
    it("should set selected day", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedDay("2025-11-15");
      });

      expect(result.current.state.selectedDay).toBe("2025-11-15");
    });

    it("should set selected slot", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedSlot(mockAvailableSlot);
      });

      expect(result.current.state.selectedSlot).toEqual(mockAvailableSlot);
    });

    it("should clear selected day", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedDay("2025-11-15");
      });

      act(() => {
        result.current.setSelectedDay(null);
      });

      expect(result.current.state.selectedDay).toBeNull();
    });
  });

  describe("Vehicle Selection", () => {
    it("should set selected vehicle", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedVehicle(mockVehicle);
      });

      expect(result.current.state.selectedVehicle).toEqual(mockVehicle);
    });

    it("should clear selected vehicle", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedVehicle(mockVehicle);
      });

      act(() => {
        result.current.setSelectedVehicle(null);
      });

      expect(result.current.state.selectedVehicle).toBeNull();
    });
  });

  describe("Data Management", () => {
    it("should set available slots", () => {
      const { result } = renderHook(() => useBookingState());
      const slots = [mockAvailableSlot];

      act(() => {
        result.current.setSlots(slots);
      });

      expect(result.current.state.slots).toEqual(slots);
    });

    it("should set vehicles list", () => {
      const { result } = renderHook(() => useBookingState());
      const vehicles = [mockVehicle];

      act(() => {
        result.current.setVehicles(vehicles);
      });

      expect(result.current.state.vehicles).toEqual(vehicles);
    });

    it("should replace existing slots when setting new ones", () => {
      const { result } = renderHook(() => useBookingState());
      const firstSlots = [mockAvailableSlot];
      const secondSlots = [{ ...mockAvailableSlot, employee_id: "emp2", employee_name: "Jane Mechanic" }];

      act(() => {
        result.current.setSlots(firstSlots);
      });

      act(() => {
        result.current.setSlots(secondSlots);
      });

      expect(result.current.state.slots).toEqual(secondSlots);
      expect(result.current.state.slots).not.toEqual(firstSlots);
    });
  });

  describe("Loading States", () => {
    it("should set loading state", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.state.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.state.isLoading).toBe(false);
    });

    it("should set creating reservation state", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setCreatingReservation(true);
      });

      expect(result.current.state.isCreatingReservation).toBe(true);

      act(() => {
        result.current.setCreatingReservation(false);
      });

      expect(result.current.state.isCreatingReservation).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should set error message", () => {
      const { result } = renderHook(() => useBookingState());
      const errorMessage = "Something went wrong";

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.state.error).toBe(errorMessage);
    });

    it("should clear error message", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setError("Error message");
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe("Reservation Summary", () => {
    it("should set reservation summary and advance to summary step", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setReservationSummary(mockReservation);
      });

      expect(result.current.state.reservationSummary).toEqual(mockReservation);
      expect(result.current.state.currentStep).toBe("reservation-summary");
    });

    it("should not change step when clearing reservation summary", () => {
      const { result } = renderHook(() => useBookingState());

      // Set reservation first
      act(() => {
        result.current.setReservationSummary(mockReservation);
      });

      // Clear it
      act(() => {
        result.current.setReservationSummary(null);
      });

      expect(result.current.state.reservationSummary).toBeNull();
      expect(result.current.state.currentStep).toBe("reservation-summary"); // Should remain unchanged
    });
  });

  describe("Step Navigation - Reset Functions", () => {
    it("should reset to service selection and clear all related data", () => {
      const { result } = renderHook(() => useBookingState());

      // Set up some state first
      act(() => {
        result.current.setSelectedService(mockService);
        result.current.setSelectedDay("2025-11-15");
        result.current.setSelectedSlot(mockAvailableSlot);
        result.current.setSelectedVehicle(mockVehicle);
        result.current.setSlots([mockAvailableSlot]);
        result.current.setVehicles([mockVehicle]);
        result.current.setError("Some error");
      });

      // Reset to service selection
      act(() => {
        result.current.resetToServiceSelection();
      });

      expect(result.current.state).toMatchObject({
        currentStep: "service-selection",
        selectedService: null,
        selectedDay: null,
        selectedSlot: null,
        selectedVehicle: null,
        slots: [],
        vehicles: [],
        error: null,
      });
    });

    it("should reset to calendar and clear booking-specific data", () => {
      const { result } = renderHook(() => useBookingState());

      // Set up some state first
      act(() => {
        result.current.setSelectedService(mockService);
        result.current.setSelectedDay("2025-11-15");
        result.current.setSelectedSlot(mockAvailableSlot);
        result.current.setSelectedVehicle(mockVehicle);
        result.current.setVehicles([mockVehicle]);
        result.current.setError("Some error");
      });

      // Reset to calendar
      act(() => {
        result.current.resetToCalendar();
      });

      expect(result.current.state).toMatchObject({
        currentStep: "calendar",
        selectedSlot: null,
        selectedVehicle: null,
        vehicles: [],
        error: null,
      });

      // Should preserve service and day selection
      expect(result.current.state.selectedService).toEqual(mockService);
      expect(result.current.state.selectedDay).toBe("2025-11-15");
    });
  });

  describe("Booking State Restoration", () => {
    it("should restore booking state from external data", () => {
      const { result } = renderHook(() => useBookingState());

      const bookingStateToRestore = {
        selectedService: mockService,
        selectedSlot: mockAvailableSlot,
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      act(() => {
        result.current.restoreBookingState(bookingStateToRestore);
      });

      expect(result.current.state.selectedService).toEqual(mockService);
      expect(result.current.state.selectedSlot).toEqual(mockAvailableSlot);
      expect(result.current.state.currentStep).toBe("booking-confirmation");
      expect(result.current.state.isLoading).toBe(true);
    });

    it("should handle restoration with partial data", () => {
      const { result } = renderHook(() => useBookingState());

      const partialBookingState = {
        selectedService: mockService,
        // Missing selectedSlot
      };

      act(() => {
        result.current.restoreBookingState(partialBookingState);
      });

      expect(result.current.state.selectedService).toEqual(mockService);
      expect(result.current.state.selectedSlot).toBeUndefined(); // Should be undefined, not null
      expect(result.current.state.currentStep).toBe("booking-confirmation");
    });
  });

  describe("Hook Stability", () => {
    it("should provide stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() => useBookingState());

      const initialFunctions = {
        setSelectedService: result.current.setSelectedService,
        setSelectedDay: result.current.setSelectedDay,
        setSelectedSlot: result.current.setSelectedSlot,
        resetToServiceSelection: result.current.resetToServiceSelection,
      };

      // Force re-render
      rerender();

      expect(result.current.setSelectedService).toBe(initialFunctions.setSelectedService);
      expect(result.current.setSelectedDay).toBe(initialFunctions.setSelectedDay);
      expect(result.current.setSelectedSlot).toBe(initialFunctions.setSelectedSlot);
      expect(result.current.resetToServiceSelection).toBe(initialFunctions.resetToServiceSelection);
    });

    it("should maintain function stability even after state changes", () => {
      const { result } = renderHook(() => useBookingState());

      const setSelectedService = result.current.setSelectedService;

      act(() => {
        result.current.setSelectedService(mockService);
      });

      expect(result.current.setSelectedService).toBe(setSelectedService);
    });
  });

  describe("Complex State Transitions", () => {
    it("should handle complete booking flow state transitions", () => {
      const { result } = renderHook(() => useBookingState());

      // Step 1: Service selection
      act(() => {
        result.current.setSelectedService(mockService);
      });
      expect(result.current.state.currentStep).toBe("calendar");

      // Step 2: Time selection (simulated - normally done by child component)
      act(() => {
        result.current.setSelectedSlot(mockAvailableSlot);
      });

      // Step 3: Vehicle selection (simulated)
      act(() => {
        result.current.setSelectedVehicle(mockVehicle);
      });

      // Step 4: Reservation creation
      act(() => {
        result.current.setReservationSummary(mockReservation);
      });
      expect(result.current.state.currentStep).toBe("reservation-summary");

      // Verify all data is preserved
      expect(result.current.state.selectedService).toEqual(mockService);
      expect(result.current.state.selectedSlot).toEqual(mockAvailableSlot);
      expect(result.current.state.selectedVehicle).toEqual(mockVehicle);
      expect(result.current.state.reservationSummary).toEqual(mockReservation);
    });

    it("should handle backward navigation correctly", () => {
      const { result } = renderHook(() => useBookingState());

      // Set up complete state
      act(() => {
        result.current.setSelectedService(mockService);
        result.current.setSelectedSlot(mockAvailableSlot);
        result.current.setSelectedVehicle(mockVehicle);
      });

      // Navigate back to calendar
      act(() => {
        result.current.resetToCalendar();
      });

      expect(result.current.state.currentStep).toBe("calendar");
      expect(result.current.state.selectedService).toEqual(mockService); // Preserved
      expect(result.current.state.selectedSlot).toBeNull(); // Cleared
      expect(result.current.state.selectedVehicle).toBeNull(); // Cleared

      // Navigate back to service selection
      act(() => {
        result.current.resetToServiceSelection();
      });

      expect(result.current.state.currentStep).toBe("service-selection");
      expect(result.current.state.selectedService).toBeNull(); // Cleared
    });
  });

  describe("Edge Cases", () => {
    it("should handle setting empty arrays", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSlots([]);
        result.current.setVehicles([]);
      });

      expect(result.current.state.slots).toEqual([]);
      expect(result.current.state.vehicles).toEqual([]);
    });

    it("should handle multiple rapid state changes", () => {
      const { result } = renderHook(() => useBookingState());

      act(() => {
        result.current.setSelectedService(mockService);
        result.current.setSelectedDay("2025-11-15");
        result.current.setSelectedSlot(mockAvailableSlot);
        result.current.setLoading(true);
        result.current.setError("Error");
        result.current.setError(null);
        result.current.setLoading(false);
      });

      expect(result.current.state.selectedService).toEqual(mockService);
      expect(result.current.state.selectedDay).toBe("2025-11-15");
      expect(result.current.state.selectedSlot).toEqual(mockAvailableSlot);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBeNull();
    });
  });
});
