import { useState } from "react";
import type { VehicleDto } from "../../types";
import { VehiclesActionPanel } from "./VehiclesActionPanel";
import { VehiclesList } from "./VehiclesList";
import { PaginationControls } from "../shared/PaginationControls";
import { LoadingIndicator } from "../shared/LoadingIndicator";
import { ErrorNotification } from "../shared/ErrorNotification";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { useVehicles } from "./hooks/useVehicles";
import { useVehicleDelete } from "./hooks/useVehicleDelete";
import { toast } from "sonner";

export function VehiclesView() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleDto | null>(null);

  // Custom hooks for data fetching and state management
  const { vehicles, isLoading, error, pagination, refetch } = useVehicles({
    page: currentPage,
  });

  const { isDeleting, deleteVehicle, clearError } = useVehicleDelete({
    onSuccess: (deletedVehicle) => {
      toast.success(`Pojazd ${deletedVehicle.license_plate} został usunięty`);
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      refetch(); // Refresh the list
    },
    onError: (error, vehicle) => {
      toast.error(`Nie udało się usunąć pojazdu ${vehicle.license_plate}: ${error.message}`);
    },
  });

  // Event handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditVehicle = (vehicle: VehicleDto) => {
    window.location.href = `/vehicles/${encodeURIComponent(vehicle.license_plate)}/edit`;
  };

  const handleDeleteVehicle = (vehicle: VehicleDto) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
    clearError(); // Clear any previous delete errors
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    
    const success = await deleteVehicle(vehicleToDelete);
    if (success) {
      // Success handling is done in the hook's onSuccess callback
    }
    // Error handling is done in the hook's onError callback
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
    clearError();
  };

  // Error handling
  if (error) {
    return (
      <ErrorNotification 
        onRetry={refetch}
        title="Nie udało się załadować pojazdów"
        message="Wystąpił problem podczas ładowania listy pojazdów. Spróbuj ponownie lub odśwież stronę."
      />
    );
  }

  // Loading state
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Empty state
  if (!isLoading && (!vehicles || vehicles.length === 0)) {
    return <EmptyStateMessage />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pojazdy</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Zarządzaj swoimi pojazdami - dodawaj, edytuj i usuwaj pojazdy z systemu.
        </p>
      </div>

      {/* Action Panel */}
      <VehiclesActionPanel onRefresh={refetch} isRefreshing={isLoading} />

      {/* Vehicles List */}
      {vehicles && (
        <VehiclesList
          vehicles={vehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
        />
      )}

      {/* Pagination */}
      {pagination && (
        <PaginationControls 
          pagination={pagination} 
          onPageChange={handlePageChange} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        vehicle={vehicleToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
