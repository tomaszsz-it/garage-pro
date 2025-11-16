import { Button } from "../ui/button";
import type { ReservationDetailViewModel } from "./hooks/useReservationDetail";
import type { ReservationUpdateDto } from "../../types";

interface ReservationActionsPanelProps {
  reservation: ReservationDetailViewModel;
  isEditing: boolean;
  isCancelling: boolean;
  onEdit: (data: ReservationUpdateDto) => void;
  onCancel: () => void;
  onEditClick: () => void;
  onCancelClick: () => void;
}

export function ReservationActionsPanel({
  reservation,
  isEditing,
  isCancelling,
  onEditClick,
  onCancelClick,
}: ReservationActionsPanelProps) {
  const handleBackToList = () => {
    window.location.href = "/reservations";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Akcje</h3>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Przycisk edycji */}
        <Button
          onClick={onEditClick}
          disabled={!reservation.canEdit || isEditing || isCancelling}
          variant="default"
          className="flex-1 sm:flex-none"
        >
          {isEditing ? "Edytowanie..." : "Edytuj rezerwację"}
        </Button>

        {/* Przycisk anulowania */}
        <Button
          onClick={onCancelClick}
          disabled={!reservation.canCancel || isEditing || isCancelling}
          variant="destructive"
          className="flex-1 sm:flex-none"
        >
          {isCancelling ? "Anulowanie..." : "Anuluj rezerwację"}
        </Button>

        {/* Przycisk powrotu */}
        <Button
          onClick={handleBackToList}
          disabled={isEditing || isCancelling}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          Powrót do listy
        </Button>
      </div>

      {/* Informacje o ograniczeniach */}
      {(!reservation.canEdit || !reservation.canCancel) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="text-sm text-yellow-800">
            <div className="font-medium mb-1">Ograniczenia:</div>
            <ul className="list-disc list-inside space-y-1">
              {!reservation.canEdit && (
                <li>
                  {reservation.isPast
                    ? "Nie można edytować przeszłych rezerwacji"
                    : "Nie można edytować anulowanych lub zakończonych rezerwacji"}
                </li>
              )}
              {!reservation.canCancel && <li>Nie można anulować zakończonych lub już anulowanych rezerwacji</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
