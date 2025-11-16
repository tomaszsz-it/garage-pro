import { Button } from "@/components/ui/button";
import { CarFront, Plus } from "lucide-react";

export function EmptyStateMessage() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="text-center py-[var(--spacing-5xl)] px-[var(--spacing-xl)] animate-[fadeIn_400ms_ease-out]"
    >
      <div className="flex justify-center mb-[var(--spacing-2xl)] p-[var(--spacing-xl)] bg-[var(--neutral-10)] rounded-full w-fit mx-auto shadow-[var(--elevation-2)]">
        <CarFront className="h-16 w-16 text-[var(--neutral-60)]" />
      </div>
      <h2 className="text-[var(--font-size-title-2)] font-[var(--font-weight-semibold)] mb-[var(--spacing-lg)] text-foreground">
        Nie masz jeszcze żadnych pojazdów
      </h2>
      <p className="text-[var(--font-size-body-large)] font-[var(--font-weight-regular)] text-[var(--neutral-70)] mb-[var(--spacing-3xl)] max-w-md mx-auto leading-[var(--line-height-body-large)]">
        Dodaj swój pierwszy pojazd, aby móc zarządzać swoimi rezerwacjami w warsztacie.
      </p>
      <div className="flex justify-center">
        <Button
          variant="default"
          onClick={() => (window.location.href = "/vehicles/new")}
          className="min-w-[12rem] hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj pierwszy pojazd
        </Button>
      </div>
    </div>
  );
}
