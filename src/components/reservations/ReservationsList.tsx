import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useMemo, useCallback } from "react";
import type { ReservationDto } from "../../types";
import type { SortField, SortDirection } from "./hooks/useReservations";
import { ReservationListItem } from "./ReservationListItem";

interface ReservationsListProps {
  reservations: ReservationDto[];
  sorting?: {
    field: SortField | null;
    direction: SortDirection;
  };
  onSortChange?: (field: SortField) => void;
}

export function ReservationsList({ reservations, sorting, onSortChange }: ReservationsListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const view = isDesktop ? "table" : "card";

  // Memoized helper function to get sort icon
  const getSortIcon = useCallback(
    (field: SortField) => {
      if (sorting?.field !== field) {
        return <ChevronsUpDown className="h-4 w-4" />;
      }
      return sorting.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    },
    [sorting?.field, sorting?.direction]
  );

  // Memoized helper function to handle sort click
  const handleSortClick = useCallback(
    (field: SortField) => {
      if (onSortChange) {
        onSortChange(field);
      }
    },
    [onSortChange]
  );

  // Memoized helper function to handle keyboard navigation
  const handleSortKeyDown = useCallback(
    (event: React.KeyboardEvent, field: SortField) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSortClick(field);
      }
    },
    [handleSortClick]
  );

  // Memoized helper function to get ARIA label for sort button
  const getSortAriaLabel = useCallback(
    (field: SortField, fieldName: string) => {
      if (sorting?.field !== field) {
        return `Sortuj według ${fieldName}`;
      }
      const direction = sorting.direction === "asc" ? "rosnąco" : "malejąco";
      const nextDirection = sorting.direction === "asc" ? "malejąco" : "rosnąco";
      return `Obecnie sortowane ${direction} według ${fieldName}. Kliknij aby sortować ${nextDirection}`;
    },
    [sorting?.field, sorting?.direction]
  );

  // Memoize table header to prevent re-renders during sorting
  const tableHeader = useMemo(
    () => (
      <thead>
        <tr className="border-b">
          <th className="p-4 text-left font-medium w-32" scope="col">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => handleSortClick("date")}
              onKeyDown={(e) => handleSortKeyDown(e, "date")}
              aria-label={getSortAriaLabel("date", "daty")}
            >
              Data
              {getSortIcon("date")}
            </button>
          </th>
          <th className="p-4 text-left font-medium w-24" scope="col">
            Godzina
          </th>
          <th className="p-4 text-left font-medium w-40" scope="col">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => handleSortClick("service")}
              onKeyDown={(e) => handleSortKeyDown(e, "service")}
              aria-label={getSortAriaLabel("service", "usługi")}
            >
              Usługa
              {getSortIcon("service")}
            </button>
          </th>
          <th className="p-4 text-left font-medium w-32" scope="col">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => handleSortClick("vehicle")}
              onKeyDown={(e) => handleSortKeyDown(e, "vehicle")}
              aria-label={getSortAriaLabel("vehicle", "pojazdu")}
            >
              Pojazd
              {getSortIcon("vehicle")}
            </button>
          </th>
          <th className="p-4 text-left font-medium w-24" scope="col">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => handleSortClick("status")}
              onKeyDown={(e) => handleSortKeyDown(e, "status")}
              aria-label={getSortAriaLabel("status", "statusu")}
            >
              Status
              {getSortIcon("status")}
            </button>
          </th>
        </tr>
      </thead>
    ),
    [getSortIcon, handleSortClick, handleSortKeyDown, getSortAriaLabel]
  );

  if (view === "table") {
    return (
      <div className="overflow-x-auto" role="region" aria-label="Lista rezerwacji">
        <table className="w-full border-collapse table-fixed" role="grid" aria-label="Rezerwacje">
          {tableHeader}
          <tbody>
            {reservations.map((reservation) => (
              <ReservationListItem key={reservation.id} reservation={reservation} view="table" />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Lista rezerwacji">
      {reservations.map((reservation) => (
        <div key={reservation.id} role="listitem">
          <ReservationListItem reservation={reservation} view="card" />
        </div>
      ))}
    </div>
  );
}
