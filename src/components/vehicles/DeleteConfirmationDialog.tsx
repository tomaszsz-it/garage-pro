import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import type { VehicleDto } from "../../types";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  vehicle: VehicleDto | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  vehicle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !vehicle) {
    return null;
  }

  const vehicleDisplayName =
    [vehicle.brand, vehicle.model, vehicle.production_year?.toString()].filter(Boolean).join(" ") ||
    vehicle.license_plate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Dialog Content */}
      <div className="relative bg-card border border-[var(--neutral-30)] rounded-[var(--radius-lg)] shadow-[var(--elevation-8)] max-w-md w-full animate-[scaleIn_200ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-[var(--spacing-2xl)] border-b border-[var(--neutral-30)]">
          <div className="flex items-center gap-[var(--spacing-sm)]">
            <div className="p-[var(--spacing-sm)] bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2
              id="delete-dialog-title"
              className="text-[var(--font-size-title-3)] font-[var(--font-weight-semibold)] text-foreground"
            >
              Usuń pojazd
            </h2>
          </div>
          {!isDeleting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 hover:bg-[var(--neutral-20)]"
              aria-label="Zamknij dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-[var(--spacing-2xl)]">
          <div
            id="delete-dialog-description"
            className="space-y-[var(--spacing-lg)] text-[var(--font-size-body)] leading-[var(--line-height-body)]"
          >
            <p className="text-[var(--neutral-80)]">
              Czy na pewno chcesz usunąć pojazd <strong className="text-foreground">{vehicle.license_plate}</strong>
              {vehicleDisplayName !== vehicle.license_plate && (
                <span className="text-[var(--neutral-70)]"> ({vehicleDisplayName})</span>
              )}
              ?
            </p>

            <div className="bg-destructive/5 border border-destructive/20 rounded-[var(--radius-md)] p-[var(--spacing-lg)]">
              <div className="flex items-start gap-[var(--spacing-sm)]">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-[var(--spacing-xs)] text-[var(--font-size-body-small)]">
                  <p className="font-[var(--font-weight-medium)] text-destructive">
                    Uwaga: Ta akcja jest nieodwracalna
                  </p>
                  <ul className="text-[var(--neutral-70)] space-y-[var(--spacing-xs)] list-disc list-inside">
                    <li>Pojazd zostanie trwale usunięty z systemu</li>
                    <li>Nie będzie można go przywrócić</li>
                    <li>Pojazd z aktywnymi rezerwacjami nie może być usunięty</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[var(--spacing-lg)] p-[var(--spacing-2xl)] border-t border-[var(--neutral-30)] bg-[var(--neutral-5)]">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="min-w-[6rem]">
            Anuluj
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="min-w-[6rem]">
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Usuwanie...
              </>
            ) : (
              "Usuń pojazd"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
