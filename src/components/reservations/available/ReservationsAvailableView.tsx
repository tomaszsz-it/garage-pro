import React, { useState } from "react";
import type { ServiceDto, AvailableReservationViewModel, VehicleDto, ReservationCreateDto, ReservationDto } from "../../../types";
import ServiceSelectionForm from "./ServiceSelectionForm";
import CalendarView from "./CalendarView";
import BookingConfirmationForm from "./BookingConfirmationForm";
import { ReservationConfirmationView } from "./ReservationConfirmationView";
import { LoadingIndicator } from "../LoadingIndicator";
import { ErrorNotification } from "../ErrorNotification";

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
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create reservation");
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
    <div className="max-w-4xl mx-auto">
      {state.currentStep !== "reservation-summary" && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dostępne terminy rezerwacji</h1>
          <p className="text-gray-600">Wybierz usługę i znajdź dostępny termin dla swojego pojazdu</p>
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
  );
};
