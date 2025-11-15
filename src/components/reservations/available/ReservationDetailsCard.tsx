import React from "react";
import type { ReservationDto } from "../../../types";

interface ReservationDetailsCardProps {
  reservation: ReservationDto;
}

export const ReservationDetailsCard: React.FC<ReservationDetailsCardProps> = ({ reservation }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      New: { label: "Nowa", className: "bg-blue-100 text-blue-800" },
      Cancelled: { label: "Anulowana", className: "bg-red-100 text-red-800" },
      Completed: { label: "Zakończona", className: "bg-green-100 text-green-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      role="region"
      aria-labelledby="reservation-details-title"
    >
      <h2 id="reservation-details-title" className="text-lg font-semibold text-gray-900 mb-4">
        Szczegóły rezerwacji
      </h2>

      <div className="space-y-4">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Data</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(reservation.start_ts)}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Godzina</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatTime(reservation.start_ts)} - {formatTime(reservation.end_ts)}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Usługa</dt>
            <dd className="mt-1 text-sm text-gray-900">{reservation.service_name}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Mechanik</dt>
            <dd className="mt-1 text-sm text-gray-900">{reservation.employee_name}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Pojazd</dt>
            <dd className="mt-1 text-sm text-gray-900">{reservation.vehicle_license_plate}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">{getStatusBadge(reservation.status)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
