import React, { useState } from "react";
import type { ServiceDto, AvailableReservationViewModel, VehicleDto, ReservationCreateDto } from "../../../types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, Car, Wrench } from "lucide-react";

interface BookingConfirmationFormProps {
  selectedService: ServiceDto;
  selectedSlot: AvailableReservationViewModel;
  selectedVehicle: VehicleDto | null;
  vehicles: VehicleDto[];
  isCreatingReservation: boolean;
  onVehicleSelect: (vehicle: VehicleDto) => void;
  onCreateReservation: (reservationData: ReservationCreateDto) => void;
  onBack: () => void;
}

const BookingConfirmationForm: React.FC<BookingConfirmationFormProps> = ({
  selectedService,
  selectedSlot,
  selectedVehicle,
  vehicles,
  isCreatingReservation,
  onVehicleSelect,
  onCreateReservation,
  onBack,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVehicleChange = (licensePlate: string) => {
    const vehicle = vehicles.find((v) => v.license_plate === licensePlate);
    if (vehicle) {
      onVehicleSelect(vehicle);
      setValidationError(null);
    }
  };

  const handleSubmit = () => {
    if (!selectedVehicle) {
      setValidationError("Wybierz pojazd do rezerwacji");
      return;
    }

    const reservationData: ReservationCreateDto = {
      service_id: selectedService.service_id,
      vehicle_license_plate: selectedVehicle.license_plate,
      employee_id: selectedSlot.employee_id,
      start_ts: selectedSlot.start_ts,
      end_ts: selectedSlot.end_ts,
    };

    onCreateReservation(reservationData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć do kalendarza</span>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Potwierdzenie rezerwacji</h2>
            <p className="text-gray-600 text-sm">Sprawdź szczegóły i wybierz pojazd</p>
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Service Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-blue-600" />
            Szczegóły usługi
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Usługa:</span>
              <p className="text-gray-900">{selectedService.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Opis:</span>
              <p className="text-gray-600 text-sm">{selectedService.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Czas trwania:</span>
              <p className="text-gray-900">{selectedService.duration_minutes} minut</p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Szczegóły terminu
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Data:</span>
              <p className="text-gray-900">{formatDate(selectedSlot.start_ts)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Godzina:</span>
              <p className="text-gray-900 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(selectedSlot.start_ts)} - {formatTime(selectedSlot.end_ts)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Car className="h-5 w-5 mr-2 text-blue-600" />
          Wybierz pojazd
        </h3>

        {vehicles.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Nie masz żadnych pojazdów.{" "}
              <a href="/vehicles" className="text-blue-600 hover:underline">
                Dodaj pojazd
              </a>{" "}
              aby móc dokonać rezerwacji.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              value={selectedVehicle?.license_plate || ""}
              onValueChange={handleVehicleChange}
              data-test-id="vehicle-select"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz pojazd..." />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.license_plate} value={vehicle.license_plate}>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{vehicle.license_plate}</span>
                      {vehicle.brand && vehicle.model && (
                        <span className="text-gray-500">
                          - {vehicle.brand} {vehicle.model}
                        </span>
                      )}
                      {vehicle.production_year && <span className="text-gray-400">({vehicle.production_year})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVehicle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Wybrany pojazd:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Numer rejestracyjny:</span>
                    <p className="font-medium text-blue-900">{selectedVehicle.license_plate}</p>
                  </div>
                  {selectedVehicle.brand && selectedVehicle.model && (
                    <div>
                      <span className="text-blue-700">Marka i model:</span>
                      <p className="font-medium text-blue-900">
                        {selectedVehicle.brand} {selectedVehicle.model}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.production_year && (
                    <div>
                      <span className="text-blue-700">Rok produkcji:</span>
                      <p className="font-medium text-blue-900">{selectedVehicle.production_year}</p>
                    </div>
                  )}
                  {selectedVehicle.vin && (
                    <div>
                      <span className="text-blue-700">VIN:</span>
                      <p className="font-medium text-blue-900">{selectedVehicle.vin}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {validationError && <div className="mt-2 text-red-600 text-sm">{validationError}</div>}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onBack} disabled={isCreatingReservation}>
          Anuluj
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedVehicle || vehicles.length === 0 || isCreatingReservation}
          className="min-w-[120px]"
          data-test-id="confirm-reservation"
        >
          {isCreatingReservation ? "Tworzenie..." : "Potwierdź rezerwację"}
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmationForm;
