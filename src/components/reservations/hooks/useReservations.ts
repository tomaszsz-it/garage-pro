import { useState, useEffect, useCallback } from "react";
import type {
  ReservationDto,
  VehicleDto,
  ReservationsListResponseDto,
  VehiclesListResponseDto,
  PaginationDto,
  ReservationStatus,
  Service,
} from "../../../types";
import { AVAILABLE_SERVICES } from "../constants";

interface UseReservationsParams {
  page: number;
  filters: {
    vehicleLicensePlate: string | null;
    serviceId: number | null;
    status: ReservationStatus | null;
  };
}

interface UseReservationsResult {
  reservations: ReservationDto[] | null;
  vehicles: VehicleDto[] | null;
  services: Service[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationDto | null;
  refetch: () => Promise<void>;
}

export function useReservations({ page, filters }: UseReservationsParams): UseReservationsResult {
  const [reservations, setReservations] = useState<ReservationDto[] | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch reservations
      const reservationsResponse = await fetch(`/api/reservations?page=${page}&limit=10`);
      if (!reservationsResponse.ok) {
        throw new Error("Failed to fetch reservations");
      }
      const reservationsData: ReservationsListResponseDto = await reservationsResponse.json();
      setReservations(reservationsData.data);
      setPagination(reservationsData.pagination);

      // Fetch vehicles if not already loaded
      if (!vehicles) {
        const vehiclesResponse = await fetch("/api/vehicles");
        if (!vehiclesResponse.ok) {
          throw new Error("Failed to fetch vehicles");
        }
        const vehiclesData: VehiclesListResponseDto = await vehiclesResponse.json();
        setVehicles(vehiclesData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
    // Note: 'vehicles' is intentionally excluded from dependencies to prevent infinite loop
    // The function checks current vehicles state value when executed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Re-fetch when fetchData changes (which includes page changes)

  // Client-side filtering
  const filteredReservations = reservations?.filter((reservation) => {
    if (filters.vehicleLicensePlate && reservation.vehicle_license_plate !== filters.vehicleLicensePlate) {
      return false;
    }
    if (filters.serviceId && reservation.service_id !== filters.serviceId) {
      return false;
    }
    if (filters.status && reservation.status !== filters.status) {
      return false;
    }
    return true;
  });

  return {
    reservations: filteredReservations || null,
    vehicles,
    services: AVAILABLE_SERVICES,
    isLoading,
    error,
    pagination,
    refetch: fetchData,
  };
}
