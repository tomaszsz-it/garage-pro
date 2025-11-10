import React, { useState } from "react";
import type {
  ServiceDto,
  AvailableReservationViewModel,
  VehicleDto,
  ReservationCreateDto,
  ReservationDto,
} from "../../../types";
import ServiceSelectionForm from "./ServiceSelectionForm";
import CalendarView from "./CalendarView";
import BookingConfirmationForm from "./BookingConfirmationForm";
import { ReservationConfirmationView } from "./ReservationConfirmationView";
import { LoadingIndicator } from "../LoadingIndicator";
import { ErrorNotification } from "../ErrorNotification";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface ReservationsAvailableViewState {
  selectedService: ServiceDto | null;
  selectedDay: string | null;
  selectedSlot: AvailableReservationViewModel | null;
  selectedVehicle: VehicleDto | null;
  slots: AvailableReservationViewModel[];
  vehicles: VehicleDto[];
  isLoading: boolean;
  isCreatingReservation: boolean;
  error: string | null;
  currentStep: "service-selection" | "calendar" | "booking-confirmation" | "reservation-summary";
  reservationSummary: ReservationDto | null;
}

export const ReservationsAvailableView: React.FC = () => {
  const [state, setState] = useState<ReservationsAvailableViewState>({
    selectedService: null,
    selectedDay: null,
    selectedSlot: null,
    selectedVehicle: null,
    slots: [],
    vehicles: [],
    isLoading: false,
    isCreatingReservation: false,
    error: null,
    currentStep: "service-selection",
    reservationSummary: null,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  // Check for pending booking state after login
  React.useEffect(() => {
    const pendingBooking = sessionStorage.getItem("pendingBooking");
    if (pendingBooking) {
      try {
        const bookingState = JSON.parse(pendingBooking);
        if (bookingState.selectedService && bookingState.selectedSlot) {
          setState((prev) => ({
            ...prev,
            selectedService: bookingState.selectedService,
            selectedSlot: bookingState.selectedSlot,
            currentStep: "booking-confirmation",
            isLoading: true,
          }));

          // Clear the saved state
          sessionStorage.removeItem("pendingBooking");

          // Fetch vehicles to continue the booking process
          const fetchVehiclesForBooking = async () => {
            try {
              const response = await fetch("/api/vehicles");
              if (response.ok) {
                const vehiclesData = await response.json();
                setState((prev) => ({
                  ...prev,
                  vehicles: vehiclesData.data,
                  isLoading: false,
                }));
              }
            } catch {
              setState((prev) => ({
                ...prev,
                error: "Failed to load vehicles",
                isLoading: false,
              }));
            }
          };

          fetchVehiclesForBooking();
        }
      } catch {
        sessionStorage.removeItem("pendingBooking");
      }
    }
  }, []);

  const handleServiceSelect = (service: ServiceDto) => {
    setState((prev) => ({
      ...prev,
      selectedService: service,
      currentStep: "calendar",
      error: null,
    }));
  };

  const handleBackToServiceSelection = () => {
    setState((prev) => ({
      ...prev,
      currentStep: "service-selection",
      selectedService: null,
      selectedDay: null,
      selectedSlot: null,
      selectedVehicle: null,
      slots: [],
      vehicles: [],
      error: null,
    }));
  };

  const handleDaySelect = (day: string) => {
    setState((prev) => ({
      ...prev,
      selectedDay: day,
    }));
  };

  const handleTimeSelect = async (slot: AvailableReservationViewModel) => {
    if (!state.selectedService) return;

    // Set selected slot and fetch vehicles
    setState((prev) => ({
      ...prev,
      selectedSlot: slot,
      isLoading: true,
      error: null,
    }));

    try {
      // Fetch user's vehicles
      const response = await fetch("/api/vehicles");

      // If user is not authenticated, fetch follows redirect to login page
      // Check if we were redirected to login page
      if (response.url.includes("/auth/login") || response.status === 401) {
        // Save current state to continue booking process after login
        const bookingState = {
          selectedService: state.selectedService,
          selectedSlot: slot,
          returnUrl: "/reservations/available",
          step: "booking-confirmation",
        };
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingState));
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      // Check if response is HTML (login page) instead of JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // We got HTML instead of JSON, probably redirected to login
        // Save current state to continue booking process after login
        const bookingState = {
          selectedService: state.selectedService,
          selectedSlot: slot,
          returnUrl: "/reservations/available",
          step: "booking-confirmation",
        };
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingState));
        window.location.href = "/auth/login";
        return;
      }

      const vehiclesData = await response.json();

      setState((prev) => ({
        ...prev,
        vehicles: vehiclesData.data,
        currentStep: "booking-confirmation",
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load vehicles",
        isLoading: false,
      }));
    }
  };

  const setSlots = (slots: AvailableReservationViewModel[]) => {
    setState((prev) => ({ ...prev, slots }));
  };

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const handleRetry = () => {
    setError(null);
    // Retry logic would be implemented here
  };

  const handleBackToCalendar = () => {
    setState((prev) => ({
      ...prev,
      currentStep: "calendar",
      selectedSlot: null,
      selectedVehicle: null,
      vehicles: [],
      error: null,
    }));
  };

  const handleVehicleSelect = (vehicle: VehicleDto) => {
    setState((prev) => ({
      ...prev,
      selectedVehicle: vehicle,
    }));
  };

  const handleCreateReservation = async (reservationData: ReservationCreateDto) => {
    setState((prev) => ({
      ...prev,
      isCreatingReservation: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      // If user is not authenticated, fetch follows redirect to login page
      // Check if we were redirected to login page
      if (response.url.includes("/auth/login") || response.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create reservation");
      }

      // Check if response is HTML (login page) instead of JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // We got HTML instead of JSON, probably redirected to login
        window.location.href = "/auth/login";
        return;
      }

      const createdReservation = await response.json();

      // Set reservation summary and move to summary step
      setState((prev) => ({
        ...prev,
        reservationSummary: createdReservation,
        currentStep: "reservation-summary",
        isCreatingReservation: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to create reservation",
        isCreatingReservation: false,
      }));
    }
  };

  const handleBackToReservations = () => {
    window.location.href = "/reservations";
  };

  return (
    <>
      {/* Full page background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />

      <div
        className={`max-w-4xl mx-auto rounded-xl p-6 ${
          isDarkMode
            ? "bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {state.currentStep !== "reservation-summary" && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Dostępne terminy rezerwacji
                </h1>
                <p className={isDarkMode ? "text-blue-100/90" : "text-gray-600"}>
                  Wybierz usługę i znajdź dostępny termin dla swojego pojazdu
                </p>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center gap-2">
                <Sun
                  size={16}
                  className={`transition-colors duration-200 ${isDarkMode ? "text-blue-300/60" : "text-yellow-500"}`}
                />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
                  className="data-[state=checked]:bg-blue-200 data-[state=unchecked]:bg-white/20"
                  aria-label="Toggle dark mode"
                />
                <Moon
                  size={16}
                  className={`transition-colors duration-200 ${isDarkMode ? "text-blue-200" : "text-blue-300/60"}`}
                />
              </div>
            </div>
          </div>
        )}

        {state.error && (
          <div className="mb-6">
            <ErrorNotification onRetry={handleRetry} />
          </div>
        )}

        {state.isLoading && (
          <div className="mb-6">
            <LoadingIndicator />
          </div>
        )}

        {state.currentStep === "service-selection" && <ServiceSelectionForm onServiceSelect={handleServiceSelect} />}

        {state.currentStep === "calendar" && state.selectedService && (
          <CalendarView
            selectedService={state.selectedService}
            availableSlots={state.slots}
            selectedDay={state.selectedDay}
            onDaySelect={handleDaySelect}
            onTimeSelect={handleTimeSelect}
            onBack={handleBackToServiceSelection}
            setSlots={setSlots}
            setLoading={setLoading}
            setError={setError}
          />
        )}

        {state.currentStep === "booking-confirmation" && state.selectedService && state.selectedSlot && (
          <BookingConfirmationForm
            selectedService={state.selectedService}
            selectedSlot={state.selectedSlot}
            selectedVehicle={state.selectedVehicle}
            vehicles={state.vehicles}
            isCreatingReservation={state.isCreatingReservation}
            onVehicleSelect={handleVehicleSelect}
            onCreateReservation={handleCreateReservation}
            onBack={handleBackToCalendar}
          />
        )}

        {state.currentStep === "reservation-summary" && state.reservationSummary && (
          <ReservationConfirmationView
            reservation={state.reservationSummary}
            onBackToReservations={handleBackToReservations}
          />
        )}
      </div>
    </>
  );
};
