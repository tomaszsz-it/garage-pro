import { useCallback } from "react";
import type {
  AvailableReservationsQueryParams,
  AvailableReservationsResponseDto,
  AvailableReservationDto,
  AvailableReservationViewModel,
} from "../../../../types";

interface UseAvailableReservationsProps {
  onSuccess: (slots: AvailableReservationViewModel[]) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

interface UseAvailableReservationsReturn {
  fetchAvailableReservations: (params: AvailableReservationsQueryParams) => Promise<void>;
}

/**
 * Custom hook for fetching available reservation slots
 * Handles API calls, data transformation, and state management
 */
export const useAvailableReservations = ({
  onSuccess,
  onError,
  onLoading,
}: UseAvailableReservationsProps): UseAvailableReservationsReturn => {
  /**
   * Maps AvailableReservationDto to AvailableReservationViewModel
   * Adds formatted display fields for the frontend
   */
  const mapToViewModel = useCallback((dto: AvailableReservationDto): AvailableReservationViewModel => {
    const startDate = new Date(dto.start_ts);
    const endDate = new Date(dto.end_ts);

    const displayDate = startDate.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const displayTime = `${startDate.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endDate.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return {
      ...dto,
      displayDate,
      displayTime,
    };
  }, []);

  /**
   * Fetches available reservation slots from the API
   */
  const fetchAvailableReservations = useCallback(
    async (params: AvailableReservationsQueryParams) => {
      try {
        onLoading(true);
        onError("");

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append("service_id", params.service_id.toString());

        if (params.start_ts) {
          queryParams.append("start_ts", params.start_ts);
        }

        if (params.end_ts) {
          queryParams.append("end_ts", params.end_ts);
        }

        if (params.limit) {
          queryParams.append("limit", params.limit.toString());
        }

        // Make API call
        const response = await fetch(`/api/reservations/available?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          let errorMessage = "Wystąpił błąd podczas pobierania dostępnych terminów";

          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Use default error message if JSON parsing fails
          }

          throw new Error(errorMessage);
        }

        const data: AvailableReservationsResponseDto = await response.json();

        // Transform data to view models
        const viewModels = data.data.map(mapToViewModel);

        onSuccess(viewModels);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas pobierania terminów";

        onError(errorMessage);
      } finally {
        onLoading(false);
      }
    },
    [mapToViewModel]
  ); // Usunięto callback z dependencies

  return {
    fetchAvailableReservations,
  };
};
