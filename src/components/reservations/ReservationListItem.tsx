import { Badge } from "@/components/ui/badge";
import type { ReservationDto, ReservationStatus } from "../../types";

interface ReservationListItemProps {
  reservation: ReservationDto;
  view: "table" | "card";
}

const STATUS_BADGES: Record<ReservationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" }> = {
  New: { label: "Nowa", variant: "default" },
  Completed: { label: "Zakończona", variant: "success" },
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
      className="hover:bg-[var(--neutral-10)] hover:shadow-[var(--elevation-2)] transition-all duration-150 ease-out cursor-pointer rounded-[var(--radius-md)] group"
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
      <td className="p-[var(--spacing-lg)] text-[var(--font-size-body)] font-[var(--font-weight-regular)] text-[var(--neutral-100)]">{formattedDate}</td>
      <td className="p-[var(--spacing-lg)] text-[var(--font-size-body)] font-[var(--font-weight-regular)] text-[var(--neutral-100)]">{formattedTime}</td>
      <td className="p-[var(--spacing-lg)] text-[var(--font-size-body)] font-[var(--font-weight-medium)] text-foreground">{reservation.service_name}</td>
      <td className="p-[var(--spacing-lg)] text-[var(--font-size-body)] font-[var(--font-weight-regular)] text-[var(--neutral-100)]">{reservation.vehicle_license_plate}</td>
      <td className="p-[var(--spacing-lg)]">
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
      className="bg-card p-[var(--spacing-xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] hover:shadow-[var(--elevation-8)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 ease-out cursor-pointer border border-[var(--neutral-30)] hover:border-[var(--neutral-40)] group"
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
      <div className="flex justify-between items-start mb-[var(--spacing-lg)]">
        <div className="space-y-[var(--spacing-xs)]">
          <p className="text-[var(--font-size-body-large)] font-[var(--font-weight-semibold)] text-foreground group-hover:text-primary transition-colors duration-150">{reservation.service_name}</p>
          <p className="text-[var(--font-size-body)] font-[var(--font-weight-regular)] text-[var(--neutral-60)]" aria-label="Numer rejestracyjny pojazdu">
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
      <div className="text-[var(--font-size-body)] text-[var(--neutral-70)] space-y-[var(--spacing-xs)]">
        <p aria-label="Data rezerwacji" className="font-[var(--font-weight-medium)]">{formattedDate}</p>
        <p aria-label="Godzina rezerwacji" className="font-[var(--font-weight-regular)]">{formattedTime}</p>
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