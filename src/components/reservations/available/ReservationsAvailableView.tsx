import React, { useState } from "react";
import type { ServiceDto, AvailableReservationViewModel } from "../../../types";
import ServiceSelectionForm from "./ServiceSelectionForm";
import CalendarView from "./CalendarView";
import { LoadingIndicator } from "../LoadingIndicator";
import { ErrorNotification } from "../ErrorNotification";

interface ReservationsAvailableViewState {
  selectedService: ServiceDto | null;
  selectedDay: string | null;
  slots: AvailableReservationViewModel[];
  isLoading: boolean;
  error: string | null;
  currentStep: "service-selection" | "calendar";
}

export const ReservationsAvailableView: React.FC = () => {
  const [state, setState] = useState<ReservationsAvailableViewState>({
    selectedService: null,
    selectedDay: null,
    slots: [],
    isLoading: false,
    error: null,
    currentStep: "service-selection",
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
      slots: [],
      error: null,
    }));
  };

  const handleDaySelect = (day: string) => {
    setState((prev) => ({
      ...prev,
      selectedDay: day,
    }));
  };

  const handleTimeSelect = (slot: AvailableReservationViewModel) => {
    if (!state.selectedService) return;

    const searchParams = new URLSearchParams({
      service_id: state.selectedService.service_id.toString(),
      start_ts: slot.start_ts,
      end_ts: slot.end_ts,
      employee_id: slot.employee_id,
    });

    // In a real app, this would use proper routing
    window.location.href = `/reservations/new?${searchParams.toString()}`;
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dostępne terminy rezerwacji</h1>
        <p className="text-gray-600">Wybierz usługę i znajdź dostępny termin dla swojego pojazdu</p>
      </div>

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
    </div>
  );
};
