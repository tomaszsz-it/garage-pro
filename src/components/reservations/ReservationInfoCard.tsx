import { Badge } from "../ui/badge";
import type { ReservationDetailViewModel } from "./hooks/useReservationDetail";

interface ReservationInfoCardProps {
  reservation: ReservationDetailViewModel;
}

export function ReservationInfoCard({ reservation }: ReservationInfoCardProps) {
  // Status badge variant based on reservation status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "New":
        return "default";
      case "Completed":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Informacje o rezerwacji</h2>
          <p className="text-sm text-gray-500">ID: {reservation.id}</p>
        </div>
        <Badge variant={getStatusVariant(reservation.status)}>{reservation.displayStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Termin rezerwacji */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Termin</h3>
          <div className="text-lg font-semibold text-gray-900">{reservation.displayDate}</div>
          <div className="text-sm text-gray-600">{reservation.displayTime}</div>
        </div>

        {/* Usługa */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Usługa</h3>
          <div className="text-lg font-semibold text-gray-900">{reservation.service_name}</div>
          <div className="text-sm text-gray-600">Czas trwania: {reservation.service_duration_minutes} min</div>
        </div>

        {/* Pojazd */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Pojazd</h3>
          <div className="text-lg font-semibold text-gray-900">{reservation.vehicle_license_plate}</div>
          {(reservation.vehicle_brand || reservation.vehicle_model) && (
            <div className="text-sm text-gray-600">
              {[reservation.vehicle_brand, reservation.vehicle_model].filter(Boolean).join(" ")}
            </div>
          )}
        </div>

        {/* Mechanik */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Mechanik</h3>
          <div className="text-lg font-semibold text-gray-900">{reservation.employee_name}</div>
          <div className="text-sm text-gray-600">ID: {reservation.employee_id}</div>
        </div>
      </div>

      {/* Daty utworzenia i aktualizacji */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Utworzono:</span> {new Date(reservation.created_at).toLocaleString("pl-PL")}
          </div>
          <div>
            <span className="font-medium">Zaktualizowano:</span>{" "}
            {new Date(reservation.updated_at).toLocaleString("pl-PL")}
          </div>
        </div>
      </div>
    </div>
  );
}
