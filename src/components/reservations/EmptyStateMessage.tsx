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
      className="text-center py-12 px-4"
    >
      <div className="flex justify-center mb-6">
        {hasFilters ? (
          <CalendarPlus className="h-16 w-16 text-muted-foreground" />
        ) : (
          <CarFront className="h-16 w-16 text-muted-foreground" />
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-4">
        {hasFilters
          ? "Brak rezerwacji spełniających kryteria"
          : "Nie masz jeszcze żadnych rezerwacji"}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {hasFilters
          ? "Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry, aby zobaczyć więcej rezerwacji."
          : "Zaplanuj swoją pierwszą wizytę w naszym warsztacie już teraz."}
      </p>
      <div className="flex justify-center gap-4">
        {hasFilters ? (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="min-w-[160px]"
          >
            Wyczyść filtry
          </Button>
        ) : (
          <>
            <Button
              variant="default"
              onClick={() => window.location.href = "/reservations/new"}
              disabled={!hasVehicles}
              className="min-w-[160px]"
            >
              Znajdź termin
            </Button>
            {!hasVehicles && (
              <Button
                variant="outline"
                onClick={() => window.location.href = "/vehicles/new"}
                className="min-w-[160px]"
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
