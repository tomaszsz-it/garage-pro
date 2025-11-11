import { useState, useEffect, useCallback } from "react";
import type {
  VehicleDto,
  VehiclesListResponseDto,
  PaginationDto,
} from "../../../types";

interface UseVehiclesParams {
  page: number;
}

interface UseVehiclesResult {
  vehicles: VehicleDto[] | null;
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationDto | null;
  refetch: () => Promise<void>;
}

export function useVehicles({ page }: UseVehiclesParams): UseVehiclesResult {
  const [vehicles, setVehicles] = useState<VehicleDto[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles?page=${page}&limit=20`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to fetch vehicles: ${response.status}`);
      }

      const data: VehiclesListResponseDto = await response.json();
      setVehicles(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setVehicles(null);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const refetch = useCallback(async () => {
    await fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    isLoading,
    error,
    pagination,
    refetch,
  };
}
