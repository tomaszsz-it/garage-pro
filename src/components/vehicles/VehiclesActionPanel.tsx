import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface VehiclesActionPanelProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function VehiclesActionPanel({ onRefresh, isRefreshing = false }: VehiclesActionPanelProps) {
  const handleAddVehicle = () => {
    window.location.href = "/vehicles/new";
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  return (
    <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[var(--font-size-title-3)] font-[var(--font-weight-semibold)] text-foreground mb-[var(--spacing-xs)]">
            Zarządzanie pojazdami
          </h2>
          <p className="text-[var(--font-size-body)] text-[var(--neutral-70)] leading-[var(--line-height-body)]">
            Dodawaj, edytuj i usuwaj swoje pojazdy z systemu
          </p>
        </div>

        <div className="flex gap-[var(--spacing-lg)]">
          {onRefresh && (
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="min-w-[8rem] hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Odświeżanie..." : "Odśwież"}
            </Button>
          )}

          <Button
            variant="default"
            onClick={handleAddVehicle}
            className="min-w-[10rem] hover:scale-105 active:scale-95 transition-all duration-150 ease-out shadow-[var(--elevation-2)] hover:shadow-[var(--elevation-4)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj pojazd
          </Button>
        </div>
      </div>
    </div>
  );
}
