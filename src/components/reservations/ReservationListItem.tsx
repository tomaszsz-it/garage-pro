import { Badge } from "@/components/ui/badge";
import type { ReservationDto, ReservationStatus } from "../../types";

interface ReservationListItemProps {
  reservation: ReservationDto;
  view: "table" | "card";
}

const STATUS_BADGES: Record<ReservationStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  New: { label: "Nowa", variant: "default" },
  Done: { label: "Zakończona", variant: "secondary" },
  Cancelled: { label: "Anulowana", variant: "destructive" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TableRow({ reservation }: { reservation: ReservationDto }) {
  const statusBadge = STATUS_BADGES[reservation.status];
  const formattedDate = formatDate(reservation.start_ts);
  const formattedTime = formatTime(reservation.start_ts);

  return (
    <tr
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => window.location.href = `/reservations/${reservation.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = `/reservations/${reservation.id}`;
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Rezerwacja ${reservation.service_name} na ${formattedDate} o ${formattedTime}, status: ${statusBadge.label}`}
    >
      <td className="p-4">{formattedDate}</td>
      <td className="p-4">{formattedTime}</td>
      <td className="p-4">{reservation.service_name}</td>
      <td className="p-4">{reservation.vehicle_license_plate}</td>
      <td className="p-4">
        <Badge variant={statusBadge.variant} aria-label={`Status: ${statusBadge.label}`}>
          {statusBadge.label}
        </Badge>
      </td>
    </tr>
  );
}

function Card({ reservation }: { reservation: ReservationDto }) {
  const statusBadge = STATUS_BADGES[reservation.status];
  const formattedDate = formatDate(reservation.start_ts);
  const formattedTime = formatTime(reservation.start_ts);

  return (
    <div
      className="bg-card p-4 rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
      onClick={() => window.location.href = `/reservations/${reservation.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = `/reservations/${reservation.id}`;
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Rezerwacja ${reservation.service_name} na ${formattedDate} o ${formattedTime}, status: ${statusBadge.label}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-lg font-medium">{reservation.service_name}</p>
          <p className="text-sm text-muted-foreground" aria-label="Numer rejestracyjny pojazdu">
            {reservation.vehicle_license_plate}
          </p>
        </div>
        <Badge 
          variant={statusBadge.variant}
          aria-label={`Status: ${statusBadge.label}`}
        >
          {statusBadge.label}
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        <p aria-label="Data rezerwacji">{formattedDate}</p>
        <p aria-label="Godzina rezerwacji">{formattedTime}</p>
      </div>
    </div>
  );
}

export function ReservationListItem({ reservation, view }: ReservationListItemProps) {
  return view === "table" ? (
    <TableRow reservation={reservation} />
  ) : (
    <Card reservation={reservation} />
  );
}