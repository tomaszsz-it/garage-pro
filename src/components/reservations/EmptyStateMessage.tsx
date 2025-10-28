import { Button } from "@/components/ui/button";
import { CalendarPlus, CarFront } from "lucide-react";

interface EmptyStateMessageProps {
  hasVehicles: boolean;
  hasFilters: boolean;
}

export function EmptyStateMessage({ hasVehicles, hasFilters }: EmptyStateMessageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="text-center py-[var(--spacing-5xl)] px-[var(--spacing-xl)] animate-[fadeIn_400ms_ease-out]"
    >
      <div className="flex justify-center mb-[var(--spacing-2xl)] p-[var(--spacing-xl)] bg-[var(--neutral-10)] rounded-full w-fit mx-auto shadow-[var(--elevation-2)]">
        {hasFilters ? (
          <CalendarPlus className="h-16 w-16 text-[var(--neutral-60)]" />
        ) : (
          <CarFront className="h-16 w-16 text-[var(--neutral-60)]" />
        )}
      </div>
      <h2 className="text-[var(--font-size-title-2)] font-[var(--font-weight-semibold)] mb-[var(--spacing-lg)] text-foreground">
        {hasFilters ? "Brak rezerwacji spełniających kryteria" : "Nie masz jeszcze żadnych rezerwacji"}
      </h2>
      <p className="text-[var(--font-size-body-large)] font-[var(--font-weight-regular)] text-[var(--neutral-70)] mb-[var(--spacing-3xl)] max-w-md mx-auto leading-[var(--line-height-body-large)]">
        {hasFilters
          ? "Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry, aby zobaczyć więcej rezerwacji."
          : "Zaplanuj swoją pierwszą wizytę w naszym warsztacie już teraz."}
      </p>
      <div className="flex justify-center gap-[var(--spacing-lg)] flex-wrap">
        {hasFilters ? (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="min-w-[10rem] hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
          >
            Wyczyść filtry
          </Button>
        ) : (
          <>
            <Button
              variant="default"
              onClick={() => (window.location.href = "/reservations/new")}
              disabled={!hasVehicles}
              className="min-w-[10rem] hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
            >
              Znajdź termin
            </Button>
            {!hasVehicles && (
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/vehicles/new")}
                className="min-w-[10rem] hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
              >
                Dodaj pojazd
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
