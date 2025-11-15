import { useState, useCallback, useEffect } from "react";
import type { VehicleDto, VehicleCreateDto, VehicleUpdateDto } from "../../../types";

interface VehicleFormData {
  license_plate: string;
  brand: string;
  model: string;
  production_year: string;
  vin: string;
  car_type: string;
}

interface VehicleFormErrors {
  license_plate?: string;
  brand?: string;
  model?: string;
  production_year?: string;
  vin?: string;
  car_type?: string;
  general?: string;
}

interface UseVehicleFormParams {
  mode: "create" | "edit";
  initialData?: VehicleDto;
  onSuccess?: (vehicle: VehicleDto) => void;
  onError?: (error: Error) => void;
}

interface UseVehicleFormResult {
  formData: VehicleFormData;
  errors: VehicleFormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
  updateField: (field: keyof VehicleFormData, value: string) => void;
  validateField: (field: keyof VehicleFormData) => string | undefined;
  validateForm: () => boolean;
  submitForm: (licensePlate?: string) => Promise<void>;
  resetForm: () => void;
}

const initialFormData: VehicleFormData = {
  license_plate: "",
  brand: "",
  model: "",
  production_year: "",
  vin: "",
  car_type: "",
};

export function useVehicleForm({ mode, initialData, onSuccess, onError }: UseVehicleFormParams): UseVehicleFormResult {
  const [formData, setFormData] = useState<VehicleFormData>(() => {
    if (initialData && mode === "edit") {
      return {
        license_plate: initialData.license_plate,
        brand: initialData.brand || "",
        model: initialData.model || "",
        production_year: initialData.production_year?.toString() || "",
        vin: initialData.vin || "",
        car_type: initialData.car_type || "",
      };
    }
    return initialFormData;
  });

  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        license_plate: initialData.license_plate,
        brand: initialData.brand || "",
        model: initialData.model || "",
        production_year: initialData.production_year?.toString() || "",
        vin: initialData.vin || "",
        car_type: initialData.car_type || "",
      });
      setIsDirty(false); // Reset dirty state when loading initial data
    }
  }, [initialData, mode]);

  const updateField = useCallback(
    (field: keyof VehicleFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validateField = useCallback(
    (field: keyof VehicleFormData): string | undefined => {
      const value = formData[field].trim();

      switch (field) {
        case "license_plate":
          // In edit mode, license plate is disabled and not validated
          if (mode === "edit") return undefined;
          if (!value) return "Numer rejestracyjny jest wymagany";
          if (value.length < 2) return "Numer rejestracyjny musi mieć co najmniej 2 znaki";
          if (value.length > 20) return "Numer rejestracyjny nie może przekraczać 20 znaków";
          if (!/^[A-Za-z0-9\s]+$/.test(value)) return "Numer rejestracyjny może zawierać tylko litery, cyfry i spacje";
          break;

        case "vin":
          if (value && value.length !== 17) return "VIN musi mieć dokładnie 17 znaków";
          if (value && !/^[A-HJ-NPR-Z0-9]{17}$/.test(value)) return "VIN zawiera nieprawidłowe znaki";
          break;

        case "brand":
          if (value && value.length > 50) return "Marka nie może przekraczać 50 znaków";
          break;

        case "model":
          if (value && value.length > 50) return "Model nie może przekraczać 50 znaków";
          break;

        case "production_year":
          if (value) {
            const year = parseInt(value, 10);
            if (isNaN(year)) return "Rok produkcji musi być liczbą";
            if (year < 1900 || year > 2050) return "Rok produkcji musi być między 1900 a 2050";
          }
          break;

        case "car_type":
          if (value && value.length > 200) return "Typ pojazdu nie może przekraczać 200 znaków";
          break;
      }

      return undefined;
    },
    [formData, mode]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: VehicleFormErrors = {};
    let isValid = true;

    // Validate all fields
    (Object.keys(formData) as (keyof VehicleFormData)[]).forEach((field) => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const submitForm = useCallback(
    async (licensePlate?: string) => {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        if (mode === "edit" && !licensePlate) {
          throw new Error("License plate is required for edit mode");
        }

        const endpoint = mode === "create" ? "/api/vehicles" : `/api/vehicles/${encodeURIComponent(licensePlate)}`;

        const method = mode === "create" ? "POST" : "PATCH";

        // Prepare payload
        let payload: VehicleCreateDto | VehicleUpdateDto;

        if (mode === "create") {
          payload = {
            license_plate: formData.license_plate.trim(),
            brand: formData.brand.trim() || undefined,
            model: formData.model.trim() || undefined,
            production_year: formData.production_year ? parseInt(formData.production_year, 10) : undefined,
            vin: formData.vin.trim() || undefined,
            car_type: formData.car_type.trim() || undefined,
          };
        } else {
          // For edit mode, only include defined values
          const updatePayload: VehicleUpdateDto = {};
          const brand = formData.brand.trim();
          const model = formData.model.trim();
          const vin = formData.vin.trim();
          const carType = formData.car_type.trim();
          const prodYear = formData.production_year ? parseInt(formData.production_year, 10) : null;

          if (brand) updatePayload.brand = brand;
          if (model) updatePayload.model = model;
          if (vin) updatePayload.vin = vin;
          if (carType) updatePayload.car_type = carType;
          if (prodYear) updatePayload.production_year = prodYear;

          payload = updatePayload;
        }

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }

          const errorData = await response.json().catch(() => ({}));

          if (response.status === 400 && errorData.errors) {
            // Handle validation errors
            const fieldErrors: VehicleFormErrors = {};
            errorData.errors.forEach((error: any) => {
              if (error.path && error.path.length > 0) {
                fieldErrors[error.path[0] as keyof VehicleFormErrors] = error.message;
              }
            });
            setErrors(fieldErrors);
            return;
          }

          if (response.status === 409) {
            // Handle conflict errors (duplicate license plate/VIN)
            const message = errorData.message || "Pojazd z tymi danymi już istnieje";
            if (message.includes("license_plate")) {
              setErrors({ license_plate: "Pojazd z tym numerem rejestracyjnym już istnieje" });
            } else if (message.includes("vin")) {
              setErrors({ vin: "Pojazd z tym numerem VIN już istnieje" });
            } else {
              setErrors({ general: message });
            }
            return;
          }

          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const vehicle: VehicleDto = await response.json();

        // Reset form state
        setIsDirty(false);
        if (mode === "create") {
          setFormData(initialFormData);
        }

        onSuccess?.(vehicle);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error occurred");
        setErrors({ general: error.message });
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, mode, validateForm, onSuccess, onError]
  );

  const resetForm = useCallback(() => {
    setFormData(
      mode === "edit" && initialData
        ? {
            license_plate: initialData.license_plate,
            brand: initialData.brand || "",
            model: initialData.model || "",
            production_year: initialData.production_year?.toString() || "",
            vin: initialData.vin || "",
            car_type: initialData.car_type || "",
          }
        : initialFormData
    );
    setErrors({});
    setIsDirty(false);
  }, [mode, initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    isDirty,
    updateField,
    validateField,
    validateForm,
    submitForm,
    resetForm,
  };
}
