import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertTriangle } from "lucide-react";
import type { ReservationDetailViewModel } from "./hooks/useReservationDetail";

interface CancelReservationDialogProps {
  reservation: ReservationDetailViewModel;
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function CancelReservationDialog({ reservation, isOpen, onConfirm, onCancel }: CancelReservationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      await onConfirm();
      onCancel(); // Close dialog on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas anulowania rezerwacji");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (!isConfirming) {
      setError(null);
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Anuluj rezerwację
          </DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz anulować tę rezerwację? Ta operacja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Reservation Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Szczegóły rezerwacji do anulowania:</h4>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Usługa:</span>
                <span className="font-medium text-gray-900">{reservation.service_name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Pojazd:</span>
                <span className="font-medium text-gray-900">{reservation.vehicle_license_plate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Termin:</span>
                <span className="font-medium text-gray-900">
                  {reservation.displayDate} {reservation.displayTime}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Mechanik:</span>
                <span className="font-medium text-gray-900">{reservation.employee_name}</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Uwaga:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Anulowana rezerwacja nie może zostać przywrócona</li>
                  <li>Termin zostanie zwolniony dla innych klientów</li>
                  <li>W przypadku problemów skontaktuj się z warsztatem</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
            Nie, zachowaj rezerwację
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? "Anulowanie..." : "Tak, anuluj rezerwację"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
