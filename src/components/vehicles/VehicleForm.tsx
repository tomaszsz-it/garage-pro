import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import type { VehicleDto } from "../../types";
import { useVehicleForm } from "./hooks/useVehicleForm";
import { toast } from "sonner";

interface VehicleFormProps {
  mode: "create" | "edit";
  licensePlate?: string;
  initialData?: VehicleDto;
}

export function VehicleForm({ mode, licensePlate, initialData }: VehicleFormProps) {
  const [vehicleData, setVehicleData] = useState<VehicleDto | undefined>(initialData);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch vehicle data for edit mode
  useEffect(() => {
    if (mode === "edit" && licensePlate && !initialData) {
      const fetchVehicle = async () => {
        setIsLoadingVehicle(true);
        setLoadError(null);

        try {
          const response = await fetch(`/api/vehicles/${encodeURIComponent(licensePlate)}`);

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Pojazd nie został znaleziony");
            }
            if (response.status === 403) {
              throw new Error("Nie masz uprawnień do edycji tego pojazdu");
            }
            throw new Error(`Błąd ładowania pojazdu: ${response.status}`);
          }

          const vehicle: VehicleDto = await response.json();
          setVehicleData(vehicle);
        } catch (error) {
          setLoadError(error instanceof Error ? error.message : "Nieznany błąd");
        } finally {
          setIsLoadingVehicle(false);
        }
      };

      fetchVehicle();
    }
  }, [mode, licensePlate, initialData]);

  // Initialize the form hook with vehicle data for edit mode or create mode
  const { formData, errors, isSubmitting, isDirty, updateField, validateField, submitForm, resetForm } = useVehicleForm(
    {
      mode,
      initialData: vehicleData,
      onSuccess: (vehicle) => {
        const message =
          mode === "create"
            ? `Pojazd ${vehicle.license_plate} został dodany`
            : `Pojazd ${vehicle.license_plate} został zaktualizowany`;

        toast.success(message);

        // Redirect after success
        setTimeout(() => {
          window.location.href = "/vehicles";
        }, 1500);
      },
      onError: (error) => {
        toast.error(`Błąd ${mode === "create" ? "dodawania" : "aktualizacji"} pojazdu: ${error.message}`);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(licensePlate);
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm("Masz niezapisane zmiany. Czy na pewno chcesz opuścić formularz?");
      if (!confirmed) return;
    }
    window.location.href = "/vehicles";
  };

  const handleReset = () => {
    if (isDirty) {
      const confirmed = window.confirm("Czy na pewno chcesz zresetować formularz? Wszystkie zmiany zostaną utracone.");
      if (!confirmed) return;
    }
    resetForm();
  };

  // Loading state for edit mode
  if (mode === "edit" && isLoadingVehicle) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]">
          <div className="flex items-center justify-center py-[var(--spacing-3xl)]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--neutral-60)]" />
            <span className="ml-[var(--spacing-sm)] text-[var(--neutral-70)]">Ładowanie danych pojazdu...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state for edit mode
  if (mode === "edit" && loadError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-destructive/10 border border-destructive/20 p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] text-center">
          <h2 className="text-[var(--font-size-title-3)] font-[var(--font-weight-semibold)] text-destructive mb-[var(--spacing-sm)]">
            Błąd ładowania pojazdu
          </h2>
          <p className="text-[var(--neutral-70)] mb-[var(--spacing-2xl)]">{loadError}</p>
          <Button variant="outline" onClick={() => (window.location.href = "/vehicles")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do listy pojazdów
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-[var(--spacing-2xl)]">
        {/* Form Header */}
        <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]">
          <div className="flex items-center justify-between mb-[var(--spacing-lg)]">
            <h2 className="text-[var(--font-size-title-2)] font-[var(--font-weight-semibold)] text-foreground">
              {mode === "create" ? "Dodaj nowy pojazd" : `Edytuj pojazd ${licensePlate}`}
            </h2>
            {isDirty && (
              <span className="text-[var(--font-size-body-small)] text-[var(--neutral-60)] bg-[var(--neutral-10)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded-[var(--radius-sm)]">
                Niezapisane zmiany
              </span>
            )}
          </div>

          {errors.general && (
            <div className="bg-destructive/10 border border-destructive/20 p-[var(--spacing-lg)] rounded-[var(--radius-md)] mb-[var(--spacing-lg)]">
              <p className="text-destructive text-[var(--font-size-body-small)]">{errors.general}</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)] space-y-[var(--spacing-2xl)]">
          {/* License Plate */}
          <div className="space-y-[var(--spacing-sm)]">
            <label
              htmlFor="license_plate"
              className="block text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground"
            >
              Numer rejestracyjny <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="license_plate"
              value={formData.license_plate}
              onChange={(e) => updateField("license_plate", e.target.value)}
              onBlur={() => validateField("license_plate")}
              disabled={mode === "edit" || isSubmitting}
              className={`w-full px-[var(--spacing-lg)] py-[var(--spacing-sm)] border rounded-[var(--radius-md)] text-[var(--font-size-body)] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.license_plate
                  ? "border-destructive bg-destructive/5"
                  : "border-[var(--neutral-30)] bg-background hover:border-[var(--neutral-40)]"
              } ${mode === "edit" ? "bg-[var(--neutral-10)] cursor-not-allowed" : ""}`}
              placeholder="np. ABC 1234"
              maxLength={20}
              required
            />
            {errors.license_plate && (
              <p className="text-destructive text-[var(--font-size-body-small)]">{errors.license_plate}</p>
            )}
            {mode === "edit" && (
              <p className="text-[var(--neutral-60)] text-[var(--font-size-body-small)]">
                Numer rejestracyjny nie może być zmieniony
              </p>
            )}
          </div>

          {/* Brand */}
          <div className="space-y-[var(--spacing-sm)]">
            <label
              htmlFor="brand"
              className="block text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground"
            >
              Marka
            </label>
            <input
              type="text"
              id="brand"
              value={formData.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              onBlur={() => validateField("brand")}
              disabled={isSubmitting}
              className={`w-full px-[var(--spacing-lg)] py-[var(--spacing-sm)] border rounded-[var(--radius-md)] text-[var(--font-size-body)] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.brand
                  ? "border-destructive bg-destructive/5"
                  : "border-[var(--neutral-30)] bg-background hover:border-[var(--neutral-40)]"
              }`}
              placeholder="np. Toyota"
              maxLength={50}
            />
            {errors.brand && <p className="text-destructive text-[var(--font-size-body-small)]">{errors.brand}</p>}
          </div>

          {/* Model */}
          <div className="space-y-[var(--spacing-sm)]">
            <label
              htmlFor="model"
              className="block text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground"
            >
              Model
            </label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => updateField("model", e.target.value)}
              onBlur={() => validateField("model")}
              disabled={isSubmitting}
              className={`w-full px-[var(--spacing-lg)] py-[var(--spacing-sm)] border rounded-[var(--radius-md)] text-[var(--font-size-body)] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.model
                  ? "border-destructive bg-destructive/5"
                  : "border-[var(--neutral-30)] bg-background hover:border-[var(--neutral-40)]"
              }`}
              placeholder="np. Corolla"
              maxLength={50}
            />
            {errors.model && <p className="text-destructive text-[var(--font-size-body-small)]">{errors.model}</p>}
          </div>

          {/* Production Year */}
          <div className="space-y-[var(--spacing-sm)]">
            <label
              htmlFor="production_year"
              className="block text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground"
            >
              Rok produkcji
            </label>
            <input
              type="number"
              id="production_year"
              value={formData.production_year}
              onChange={(e) => updateField("production_year", e.target.value)}
              onBlur={() => validateField("production_year")}
              disabled={isSubmitting}
              className={`w-full px-[var(--spacing-lg)] py-[var(--spacing-sm)] border rounded-[var(--radius-md)] text-[var(--font-size-body)] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.production_year
                  ? "border-destructive bg-destructive/5"
                  : "border-[var(--neutral-30)] bg-background hover:border-[var(--neutral-40)]"
              }`}
              placeholder="np. 2020"
              min={1900}
              max={2050}
            />
            {errors.production_year && (
              <p className="text-destructive text-[var(--font-size-body-small)]">{errors.production_year}</p>
            )}
          </div>

          {/* VIN */}
          <div className="space-y-[var(--spacing-sm)]">
            <label
              htmlFor="vin"
              className="block text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground"
            >
              Numer VIN
            </label>
            <input
              type="text"
              id="vin"
              value={formData.vin}
              onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
              onBlur={() => validateField("vin")}
              disabled={isSubmitting}
              className={`w-full px-[var(--spacing-lg)] py-[var(--spacing-sm)] border rounded-[var(--radius-md)] text-[var(--font-size-body)] font-mono transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.vin
                  ? "border-destructive bg-destructive/5"
                  : "border-[var(--neutral-30)] bg-background hover:border-[var(--neutral-40)]"
              }`}
              placeholder="17-znakowy numer VIN"
              maxLength={17}
            />
            {errors.vin && <p className="text-destructive text-[var(--font-size-body-small)]">{errors.vin}</p>}
            <p className="text-[var(--neutral-60)] text-[var(--font-size-body-small)]">
              Opcjonalne. Jeśli podasz VIN, musi mieć dokładnie 17 znaków.
            </p>
          </div>

          {/* Car Type */}
          <div className="space-y-[var(--spacing-sm)]">
            <label
              htmlFor="car_type"
              className="block text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground"
            >
              Typ pojazdu
            </label>
            <input
              type="text"
              id="car_type"
              value={formData.car_type}
              onChange={(e) => updateField("car_type", e.target.value)}
              onBlur={() => validateField("car_type")}
              disabled={isSubmitting}
              className={`w-full px-[var(--spacing-lg)] py-[var(--spacing-sm)] border rounded-[var(--radius-md)] text-[var(--font-size-body)] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.car_type
                  ? "border-destructive bg-destructive/5"
                  : "border-[var(--neutral-30)] bg-background hover:border-[var(--neutral-40)]"
              }`}
              placeholder="np. Sedan, Hatchback, SUV"
              maxLength={200}
            />
            {errors.car_type && (
              <p className="text-destructive text-[var(--font-size-body-small)]">{errors.car_type}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="min-w-[8rem]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anuluj
            </Button>

            <div className="flex gap-[var(--spacing-lg)]">
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="min-w-[8rem]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Resetuj
                </Button>
              )}

              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting || (!isDirty && mode === "edit")}
                className="min-w-[10rem]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {mode === "create" ? "Dodawanie..." : "Zapisywanie..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === "create" ? "Dodaj pojazd" : "Zapisz zmiany"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
