import { useState } from "react";
import { toast } from "sonner";
import { useReservationDetail } from "./hooks/useReservationDetail";
import { ReservationInfoCard } from "./ReservationInfoCard";
import { ReservationActionsPanel } from "./ReservationActionsPanel";
import { EditReservationDialog } from "./EditReservationDialog";
import { CancelReservationDialog } from "./CancelReservationDialog";
import { RecommendationDisplay } from "./RecommendationDisplay";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorNotification } from "./ErrorNotification";
import type { ReservationUpdateDto } from "../../types";

interface ReservationDetailViewProps {
  reservationId: string;
}

export function ReservationDetailView({ reservationId }: ReservationDetailViewProps) {
  const {
    reservation,
    isLoading,
    error,
    isEditing,
    isCancelling,
    loadReservation,
    editReservation,
    cancelReservation,
  } = useReservationDetail(reservationId);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleEditClick = () => {
    if (reservation?.canEdit) {
      setIsEditDialogOpen(true);
    }
  };

  const handleCancelClick = () => {
    if (reservation?.canCancel) {
      setIsCancelDialogOpen(true);
    }
  };

  const handleEditSave = async (data: ReservationUpdateDto) => {
    try {
      await editReservation(data);
      toast.success("Rezerwacja została zaktualizowana pomyślnie");
      setIsEditDialogOpen(false);
    } catch {
      // Error is already handled in the hook and dialog
      toast.error("Nie udało się zaktualizować rezerwacji");
    }
  };

  const handleCancelConfirm = async () => {
    try {
      await cancelReservation();
      toast.success("Rezerwacja została anulowana");
      setIsCancelDialogOpen(false);

      // Redirect to reservations list after successful cancellation
      setTimeout(() => {
        window.location.href = "/reservations";
      }, 1500);
    } catch {
      // Error is already handled in the hook and dialog
      toast.error("Nie udało się anulować rezerwacji");
    }
  };

  const handleRetry = () => {
    loadReservation();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingIndicator />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorNotification message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // No reservation found
  if (!reservation) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorNotification message="Nie znaleziono rezerwacji" onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main reservation info */}
      <ReservationInfoCard reservation={reservation} />

      {/* Actions panel */}
      <ReservationActionsPanel
        reservation={reservation}
        isEditing={isEditing}
        isCancelling={isCancelling}
        onEdit={handleEditSave}
        onCancel={handleCancelConfirm}
        onEditClick={handleEditClick}
        onCancelClick={handleCancelClick}
      />

      {/* AI Recommendations */}
      {reservation.recommendation_text && <RecommendationDisplay recommendation={reservation.recommendation_text} />}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <EditReservationDialog
          reservation={reservation}
          isOpen={isEditDialogOpen}
          onSave={handleEditSave}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      )}

      {/* Cancel Dialog */}
      {isCancelDialogOpen && (
        <CancelReservationDialog
          reservation={reservation}
          isOpen={isCancelDialogOpen}
          onConfirm={handleCancelConfirm}
          onCancel={() => setIsCancelDialogOpen(false)}
        />
      )}
    </div>
  );
}
