import { useState, useCallback } from 'react';
import type {
  ServiceDto,
  AvailableReservationViewModel,
  VehicleDto,
  ReservationDto,
} from '../types';

type BookingStep = "service-selection" | "calendar" | "booking-confirmation" | "reservation-summary";

interface BookingState {
  selectedService: ServiceDto | null;
  selectedDay: string | null;
  selectedSlot: AvailableReservationViewModel | null;
  selectedVehicle: VehicleDto | null;
  slots: AvailableReservationViewModel[];
  vehicles: VehicleDto[];
  isLoading: boolean;
  isCreatingReservation: boolean;
  error: string | null;
  currentStep: BookingStep;
  reservationSummary: ReservationDto | null;
}

const initialState: BookingState = {
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
};

export const useBookingState = () => {
  const [state, setState] = useState<BookingState>(initialState);

  const setSelectedService = useCallback((service: ServiceDto | null) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      currentStep: service ? "calendar" : "service-selection",
      error: null,
    }));
  }, []);

  const setSelectedDay = useCallback((day: string | null) => {
    setState(prev => ({ ...prev, selectedDay: day }));
  }, []);

  const setSelectedSlot = useCallback((slot: AvailableReservationViewModel | null) => {
    setState(prev => ({ ...prev, selectedSlot: slot }));
  }, []);

  const setSelectedVehicle = useCallback((vehicle: VehicleDto | null) => {
    setState(prev => ({ ...prev, selectedVehicle: vehicle }));
  }, []);

  const setSlots = useCallback((slots: AvailableReservationViewModel[]) => {
    setState(prev => ({ ...prev, slots }));
  }, []);

  const setVehicles = useCallback((vehicles: VehicleDto[]) => {
    setState(prev => ({ ...prev, vehicles }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setCreatingReservation = useCallback((isCreatingReservation: boolean) => {
    setState(prev => ({ ...prev, isCreatingReservation }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setCurrentStep = useCallback((step: BookingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setReservationSummary = useCallback((reservation: ReservationDto | null) => {
    setState(prev => ({ 
      ...prev, 
      reservationSummary: reservation,
      currentStep: reservation ? "reservation-summary" : prev.currentStep,
    }));
  }, []);

  const resetToServiceSelection = useCallback(() => {
    setState(prev => ({
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
  }, []);

  const resetToCalendar = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: "calendar",
      selectedSlot: null,
      selectedVehicle: null,
      vehicles: [],
      error: null,
    }));
  }, []);

  const restoreBookingState = useCallback((bookingState: any) => {
    setState(prev => ({
      ...prev,
      selectedService: bookingState.selectedService,
      selectedSlot: bookingState.selectedSlot,
      currentStep: "booking-confirmation",
      isLoading: true,
    }));
  }, []);

  return {
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
  };
};

