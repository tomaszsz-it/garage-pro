import React, { useCallback, useEffect } from "react";
import type { ServiceDto, AvailableReservationViewModel, VehicleDto, ReservationCreateDto } from "../../../types";
import ServiceSelectionForm from "./ServiceSelectionForm";
import CalendarView from "./CalendarView";
import BookingConfirmationForm from "./BookingConfirmationForm";
import { ReservationConfirmationView } from "./ReservationConfirmationView";
import { LoadingIndicator } from "../LoadingIndicator";
import { ErrorNotification } from "../ErrorNotification";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useBookingState } from "../../../hooks/useBookingState";
import { useAuthRedirect } from "../../../hooks/useAuthRedirect";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { useApiWithRetry } from "../../../hooks/useApiWithRetry";

const ReservationsAvailableView: React.FC = React.memo(() => {
  const {
    state,
    setSelectedService,
    setSelectedDay,
    setSelectedSlot,
    setSelectedVehicle,
    setSlots,
    setVehicles,
    setLoading,
    setCreatingReservation,
    setError,
    setCurrentStep,
    setReservationSummary,
    resetToServiceSelection,
    resetToCalendar,
    restoreBookingState,
  } = useBookingState();

  const { getPendingBooking } = useAuthRedirect();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { makeApiCall } = useApiWithRetry();

  // Check for pending booking state after login
  useEffect(() => {
    const bookingState = getPendingBooking();
    if (bookingState?.selectedService && bookingState?.selectedSlot) {
      restoreBookingState(bookingState);

      // Fetch vehicles to continue the booking process
      const fetchVehiclesForBooking = async () => {
        try {
          const response = await makeApiCall("/api/vehicles");
          if (response) {
            const vehiclesData = await response.json();
            setVehicles(vehiclesData.data);
          }
          setLoading(false);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to load vehicles");
          setLoading(false);
        }
      };

      fetchVehiclesForBooking();
    }
  }, [getPendingBooking, restoreBookingState, makeApiCall, setVehicles, setLoading, setError]);

  const handleServiceSelect = useCallback(
    (service: ServiceDto) => {
      setSelectedService(service);
    },
    [setSelectedService]
  );

  const handleBackToServiceSelection = useCallback(() => {
    resetToServiceSelection();
  }, [resetToServiceSelection]);

  const handleDaySelect = useCallback(
    (day: string) => {
      setSelectedDay(day);
    },
    [setSelectedDay]
  );

  const handleTimeSelect = useCallback(
    async (slot: AvailableReservationViewModel) => {
      if (!state.selectedService) return;

      // Set selected slot and fetch vehicles
      setSelectedSlot(slot);
      setLoading(true);
      setError(null);

      try {
        const pendingBookingState = {
          selectedService: state.selectedService,
          selectedSlot: slot,
          returnUrl: "/reservations/available",
          step: "booking-confirmation",
        };

        const response = await makeApiCall("/api/vehicles", {}, pendingBookingState);

        if (response) {
          const vehiclesData = await response.json();
          setVehicles(vehiclesData.data);
        }
        setLoading(false);
        setCurrentStep("booking-confirmation");
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load vehicles");
        setLoading(false);
      }
    },
    [state.selectedService, setSelectedSlot, setLoading, setError, makeApiCall, setVehicles, setCurrentStep]
  );

  const handleRetry = useCallback(async () => {
    setError(null);
    // Retry the last failed operation based on current step
    if (state.currentStep === "booking-confirmation" && state.selectedService && state.selectedSlot) {
      await handleTimeSelect(state.selectedSlot);
    }
  }, [setError, state.currentStep, state.selectedService, state.selectedSlot, handleTimeSelect]);

  const handleBackToCalendar = useCallback(() => {
    resetToCalendar();
  }, [resetToCalendar]);

  const handleVehicleSelect = useCallback(
    (vehicle: VehicleDto) => {
      setSelectedVehicle(vehicle);
    },
    [setSelectedVehicle]
  );

  const handleCreateReservation = useCallback(
    async (reservationData: ReservationCreateDto) => {
      setCreatingReservation(true);
      setError(null);

      try {
        const response = await makeApiCall("/api/reservations", {
          method: "POST",
          body: JSON.stringify(reservationData),
        });

        if (response) {
          const createdReservation = await response.json();
          setReservationSummary(createdReservation);
        }
        setCreatingReservation(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to create reservation");
        setCreatingReservation(false);
      }
    },
    [setCreatingReservation, setError, makeApiCall, setReservationSummary]
  );

  const handleBackToReservations = useCallback(() => {
    window.location.href = "/reservations";
  }, []);

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
                  onCheckedChange={toggleDarkMode}
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
});

ReservationsAvailableView.displayName = "ReservationsAvailableView";

export { ReservationsAvailableView };
