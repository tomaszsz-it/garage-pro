import { useState, useEffect, useCallback } from "react";
import type { ReservationDetailDto, ReservationUpdateDto } from "../../../types";

// Extended ViewModel with UI-specific properties
export interface ReservationDetailViewModel extends ReservationDetailDto {
  displayDate: string;        // "DD.MM.YYYY"
  displayTime: string;        // "HH:MM - HH:MM"
  displayStatus: string;      // "Nowa", "Anulowana", "Zakończona"
  canEdit: boolean;           // czy można edytować
  canCancel: boolean;         // czy można anulować
  isPast: boolean;            // czy termin minął
}

interface UseReservationDetailState {
  reservation: ReservationDetailViewModel | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  isCancelling: boolean;
}

interface UseReservationDetailResult extends UseReservationDetailState {
  loadReservation: () => Promise<void>;
  editReservation: (data: ReservationUpdateDto) => Promise<void>;
  cancelReservation: () => Promise<void>;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Helper function to format time range
function formatTimeRange(startString: string, endString: string): string {
  const start = new Date(startString);
  const end = new Date(endString);
  
  const startTime = start.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  return `${startTime} - ${endTime}`;
}

// Helper function to format status
function formatStatus(status: string): string {
  switch (status) {
    case "New":
      return "Nowa";
    case "Cancelled":
      return "Anulowana";
    case "Completed":
      return "Zakończona";
    default:
      return status;
  }
}

// Helper function to check if reservation is in the past
function isPastReservation(startString: string): boolean {
  const start = new Date(startString);
  const now = new Date();
  return start < now;
}

// Helper function to determine if reservation can be edited
function canEditReservation(reservation: ReservationDetailDto): boolean {
  // Can't edit past reservations
  if (isPastReservation(reservation.start_ts)) {
    return false;
  }
  
  // Can't edit cancelled or completed reservations
  if (reservation.status === "Cancelled" || reservation.status === "Completed") {
    return false;
  }
  
  return true;
}

// Helper function to determine if reservation can be cancelled
function canCancelReservation(reservation: ReservationDetailDto): boolean {
  // Can't cancel already cancelled or completed reservations
  if (reservation.status === "Cancelled" || reservation.status === "Completed") {
    return false;
  }
  
  return true;
}

// Transform ReservationDetailDto to ViewModel
function transformToViewModel(reservation: ReservationDetailDto): ReservationDetailViewModel {
  const isPast = isPastReservation(reservation.start_ts);
  const canEdit = canEditReservation(reservation);
  const canCancel = canCancelReservation(reservation);
  
  return {
    ...reservation,
    displayDate: formatDate(reservation.start_ts),
    displayTime: formatTimeRange(reservation.start_ts, reservation.end_ts),
    displayStatus: formatStatus(reservation.status),
    canEdit,
    canCancel,
    isPast,
  };
}

export function useReservationDetail(reservationId: string): UseReservationDetailResult {
  const [state, setState] = useState<UseReservationDetailState>({
    reservation: null,
    isLoading: true,
    error: null,
    isEditing: false,
    isCancelling: false,
  });

  const loadReservation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/reservations/${reservationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const reservationData: ReservationDetailDto = await response.json();
      const viewModel = transformToViewModel(reservationData);
      
      setState(prev => ({
        ...prev,
        reservation: viewModel,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        reservation: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Wystąpił błąd podczas ładowania rezerwacji",
      }));
    }
  }, [reservationId]);

  const editReservation = useCallback(async (data: ReservationUpdateDto) => {
    if (!state.reservation) return;
    
    setState(prev => ({ ...prev, isEditing: true, error: null }));
    
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const updatedReservation: ReservationDetailDto = await response.json();
      const viewModel = transformToViewModel(updatedReservation);
      
      setState(prev => ({
        ...prev,
        reservation: viewModel,
        isEditing: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isEditing: false,
        error: error instanceof Error ? error.message : "Wystąpił błąd podczas edycji rezerwacji",
      }));
      throw error; // Re-throw to allow component to handle it
    }
  }, [reservationId, state.reservation]);

  const cancelReservation = useCallback(async () => {
    if (!state.reservation) return;
    
    setState(prev => ({ ...prev, isCancelling: true, error: null }));
    
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const updatedReservation: ReservationDetailDto = await response.json();
      const viewModel = transformToViewModel(updatedReservation);
      
      setState(prev => ({
        ...prev,
        reservation: viewModel,
        isCancelling: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCancelling: false,
        error: error instanceof Error ? error.message : "Wystąpił błąd podczas anulowania rezerwacji",
      }));
      throw error; // Re-throw to allow component to handle it
    }
  }, [reservationId, state.reservation]);

  // Load reservation on mount and when ID changes
  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  return {
    ...state,
    loadReservation,
    editReservation,
    cancelReservation,
  };
}