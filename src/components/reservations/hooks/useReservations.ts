import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

// Sorting types
export type SortField = 'date' | 'service' | 'vehicle' | 'status';
export type SortDirection = 'asc' | 'desc';

interface UseReservationsParams {
  page: number;
  limit?: number;
  filters: {
    vehicleLicensePlate: string | null;
    serviceId: number | null;
    status: ReservationStatus | null;
  };
  sorting?: {
    field: SortField | null;
    direction: SortDirection;
  };
  enabled?: boolean;
}

interface UseReservationsResult {
  reservations: ReservationDto[] | null;
  vehicles: VehicleDto[] | null;
  services: Service[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationDto | null;
  totalReservations: number;
  refetch: () => Promise<void>;
}

export function useReservations({ 
  page, 
  limit = 10, 
  filters, 
  sorting,
  enabled = true
}: UseReservationsParams): UseReservationsResult {
  const [allReservations, setAllReservations] = useState<ReservationDto[] | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to prevent unnecessary re-fetches when vehicles are already loaded
  const vehiclesLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch ALL reservations (limit=100 to get all data for client-side processing)
      const reservationsResponse = await fetch(`/api/reservations?page=1&limit=100`);
      if (!reservationsResponse.ok) {
        const errorText = await reservationsResponse.text();
        console.error("Reservations API error:", reservationsResponse.status, errorText);
        throw new Error(`Failed to fetch reservations: ${reservationsResponse.status} ${errorText}`);
      }
      const reservationsData: ReservationsListResponseDto = await reservationsResponse.json();
      setAllReservations(reservationsData.data);

      // Fetch vehicles if not already loaded
      if (!vehiclesLoadedRef.current) {
        const vehiclesResponse = await fetch("/api/vehicles");
        if (!vehiclesResponse.ok) {
          throw new Error("Failed to fetch vehicles");
        }
        const vehiclesData: VehiclesListResponseDto = await vehiclesResponse.json();
        setVehicles(vehiclesData.data);
        vehiclesLoadedRef.current = true;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
    // Note: 'vehicles' is intentionally excluded from dependencies to prevent infinite loop
    // The function checks current vehicles state value when executed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Client-side filtering, sorting, and pagination
  const processedReservations = useMemo(() => {
    if (!allReservations) return null;

    // Step 1: Filter reservations
    let filtered = allReservations.filter((reservation) => {
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

    // Step 2: Sort reservations
    if (sorting?.field) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sorting.field) {
          case 'date':
            aValue = new Date(a.start_ts).getTime();
            bValue = new Date(b.start_ts).getTime();
            break;
          case 'service':
            aValue = a.service_name.toLowerCase();
            bValue = b.service_name.toLowerCase();
            break;
          case 'vehicle':
            aValue = a.vehicle_license_plate.toLowerCase();
            bValue = b.vehicle_license_plate.toLowerCase();
            break;
          case 'status':
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sorting.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sorting.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [allReservations, filters, sorting]);

  // Client-side pagination
  const paginatedReservations = useMemo(() => {
    if (!processedReservations) return null;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return processedReservations.slice(startIndex, endIndex);
  }, [processedReservations, page, limit]);

  // Create pagination metadata
  const pagination = useMemo(() => {
    if (!processedReservations) return null;

    const total = processedReservations.length;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
    } as PaginationDto;
  }, [processedReservations, page, limit]);

  return {
    reservations: paginatedReservations,
    vehicles,
    services: AVAILABLE_SERVICES,
    isLoading,
    error,
    pagination,
    totalReservations: processedReservations?.length || 0,
    refetch: fetchData,
  };
}
