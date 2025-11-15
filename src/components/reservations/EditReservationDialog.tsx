import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import type { ReservationDetailViewModel } from "./hooks/useReservationDetail";
import type { ReservationUpdateDto, VehicleDto, ServiceDto, AvailableReservationDto } from "../../types";

interface EditReservationDialogProps {
  reservation: ReservationDetailViewModel;
  isOpen: boolean;
  onSave: (data: ReservationUpdateDto) => Promise<void>;
  onCancel: () => void;
}

interface EditFormData {
  vehicle_license_plate: string;
  service_id: number;
  employee_id: string;
  start_ts: string;
  end_ts: string;
}

export function EditReservationDialog({ reservation, isOpen, onSave, onCancel }: EditReservationDialogProps) {
  const [formData, setFormData] = useState<EditFormData>({
    vehicle_license_plate: reservation.vehicle_license_plate,
    service_id: reservation.service_id,
    employee_id: reservation.employee_id,
    start_ts: reservation.start_ts,
    end_ts: reservation.end_ts,
  });

  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableReservationDto[]>([]);

  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Load vehicles on dialog open
  useEffect(() => {
    if (isOpen && vehicles.length === 0) {
      loadVehicles();
    }
  }, [isOpen, vehicles.length]);

  // Load services on dialog open
  useEffect(() => {
    if (isOpen && services.length === 0) {
      loadServices();
    }
  }, [isOpen, services.length]);

  // Load available slots when service changes
  useEffect(() => {
    if (isOpen && formData.service_id) {
      loadAvailableSlots(formData.service_id);
    }
  }, [isOpen, formData.service_id]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicle_license_plate: reservation.vehicle_license_plate,
        service_id: reservation.service_id,
        employee_id: reservation.employee_id,
        start_ts: reservation.start_ts,
        end_ts: reservation.end_ts,
      });
      setError(null);
    }
  }, [isOpen, reservation]);

  const loadVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const response = await fetch("/api/vehicles");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać listy pojazdów");
      }
      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas ładowania pojazdów");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać listy usług");
      }
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas ładowania usług");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadAvailableSlots = async (serviceId: number) => {
    setIsLoadingSlots(true);
    try {
      // Get next 30 days of availability
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const params = new URLSearchParams({
        service_id: serviceId.toString(),
        start_ts: startDate.toISOString(),
        end_ts: endDate.toISOString(),
        limit: "50",
      });

      const response = await fetch(`/api/reservations/available?${params}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać dostępnych terminów");
      }
      const data = await response.json();
      setAvailableSlots(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas ładowania terminów");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleServiceChange = (serviceIdStr: string) => {
    const serviceId = parseInt(serviceIdStr);
    setFormData((prev) => ({
      ...prev,
      service_id: serviceId,
      // Reset time slot when service changes
      employee_id: "",
      start_ts: "",
      end_ts: "",
    }));
  };

  const handleTimeSlotChange = (slotValue: string) => {
    const slot = availableSlots.find((s) => `${s.employee_id}:${s.start_ts}:${s.end_ts}` === slotValue);

    if (slot) {
      setFormData((prev) => ({
        ...prev,
        employee_id: slot.employee_id,
        start_ts: slot.start_ts,
        end_ts: slot.end_ts,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.vehicle_license_plate ||
        !formData.service_id ||
        !formData.employee_id ||
        !formData.start_ts ||
        !formData.end_ts
      ) {
        throw new Error("Wszystkie pola są wymagane");
      }

      const updateData: ReservationUpdateDto = {
        vehicle_license_plate: formData.vehicle_license_plate,
        service_id: formData.service_id,
        start_ts: formData.start_ts,
        end_ts: formData.end_ts,
      };

      await onSave(updateData);
      onCancel(); // Close dialog on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeSlot = (slot: AvailableReservationDto) => {
    const start = new Date(slot.start_ts);
    const end = new Date(slot.end_ts);

    const dateStr = start.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

    const timeStr = `${start.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return `${dateStr} ${timeStr} (${slot.employee_name})`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj rezerwację</DialogTitle>
          <DialogDescription>Zmień szczegóły swojej rezerwacji. Wszystkie pola są wymagane.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Pojazd</label>
            <Select
              value={formData.vehicle_license_plate}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, vehicle_license_plate: value }))}
              disabled={isLoadingVehicles || isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingVehicles ? "Ładowanie..." : "Wybierz pojazd"} />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.license_plate} value={vehicle.license_plate}>
                    {vehicle.license_plate}
                    {(vehicle.brand || vehicle.model) && (
                      <span className="text-gray-500 ml-2">
                        ({[vehicle.brand, vehicle.model].filter(Boolean).join(" ")})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Usługa</label>
            <Select
              value={formData.service_id.toString()}
              onValueChange={handleServiceChange}
              disabled={isLoadingServices || isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingServices ? "Ładowanie..." : "Wybierz usługę"} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.service_id} value={service.service_id.toString()}>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">
                        {service.duration_minutes} min - {service.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Termin</label>
            <Select
              value={
                formData.employee_id && formData.start_ts && formData.end_ts
                  ? `${formData.employee_id}:${formData.start_ts}:${formData.end_ts}`
                  : ""
              }
              onValueChange={handleTimeSlotChange}
              disabled={!formData.service_id || isLoadingSlots || isSaving}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !formData.service_id
                      ? "Najpierw wybierz usługę"
                      : isLoadingSlots
                        ? "Ładowanie terminów..."
                        : "Wybierz termin"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem
                    key={`${slot.employee_id}:${slot.start_ts}:${slot.end_ts}`}
                    value={`${slot.employee_id}:${slot.start_ts}:${slot.end_ts}`}
                  >
                    {formatTimeSlot(slot)}
                  </SelectItem>
                ))}
                {availableSlots.length === 0 && !isLoadingSlots && (
                  <SelectItem value="" disabled>
                    Brak dostępnych terminów
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
