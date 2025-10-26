import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ReservationDto } from "../../types";
import { ReservationListItem } from "./ReservationListItem";

interface ReservationsListProps {
  reservations: ReservationDto[];
}

export function ReservationsList({ reservations }: ReservationsListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const view = isDesktop ? "table" : "card";

  if (view === "table") {
    return (
      <div 
        className="overflow-x-auto"
        role="region"
        aria-label="Lista rezerwacji"
        tabIndex={0}
      >
        <table 
          className="w-full border-collapse"
          role="grid"
          aria-label="Rezerwacje"
        >
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left font-medium" scope="col">Data</th>
              <th className="p-4 text-left font-medium" scope="col">Godzina</th>
              <th className="p-4 text-left font-medium" scope="col">Usługa</th>
              <th className="p-4 text-left font-medium" scope="col">Pojazd</th>
              <th className="p-4 text-left font-medium" scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <ReservationListItem
                key={reservation.id}
                reservation={reservation}
                view="table"
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div 
      className="space-y-4"
      role="list"
      aria-label="Lista rezerwacji"
    >
      {reservations.map((reservation) => (
        <div 
          key={reservation.id}
          role="listitem"
        >
          <ReservationListItem
            reservation={reservation}
            view="card"
          />
        </div>
      ))}
    </div>
  );
}