import { useState, useCallback } from "react";
import type { VehicleDto } from "../../../types";

interface UseVehicleDeleteParams {
  onSuccess?: (deletedVehicle: VehicleDto) => void;
  onError?: (error: Error, vehicle: VehicleDto) => void;
}

interface UseVehicleDeleteResult {
  isDeleting: boolean;
  deleteError: Error | null;
  deleteVehicle: (vehicle: VehicleDto) => Promise<boolean>;
  clearError: () => void;
}

export function useVehicleDelete({ onSuccess, onError }: UseVehicleDeleteParams = {}): UseVehicleDeleteResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const deleteVehicle = useCallback(
    async (vehicle: VehicleDto): Promise<boolean> => {
      setIsDeleting(true);
      setDeleteError(null);

      try {
        const response = await fetch(`/api/vehicles/${encodeURIComponent(vehicle.license_plate)}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = "/login";
            return false;
          }

          if (response.status === 403) {
            throw new Error("Nie masz uprawnień do usunięcia tego pojazdu");
          }

          if (response.status === 404) {
            throw new Error("Pojazd nie został znaleziony");
          }

          if (response.status === 409) {
            // Handle conflict - vehicle has active reservations
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.message || "Nie można usunąć pojazdu z aktywnymi rezerwacjami";
            throw new Error(message);
          }

          // Handle other server errors
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Błąd serwera: ${response.status}`);
        }

        // Success - vehicle deleted (204 No Content)
        onSuccess?.(vehicle);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Nieznany błąd podczas usuwania pojazdu");
        setDeleteError(error);
        onError?.(error, vehicle);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [onSuccess, onError]
  );

  const clearError = useCallback(() => {
    setDeleteError(null);
  }, []);

  return {
    isDeleting,
    deleteError,
    deleteVehicle,
    clearError,
  };
}
