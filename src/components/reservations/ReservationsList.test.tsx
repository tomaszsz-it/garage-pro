import { render, screen } from "@testing-library/react";
import { ReservationsList } from "./ReservationsList";
import type { ReservationDto } from "../../types";
import * as useMediaQueryModule from "@/hooks/useMediaQuery";

// Mock useMediaQuery hook
jest.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(),
}));

const mockReservations: ReservationDto[] = [
  {
    id: "1",
    service_id: 1,
    service_name: "Wymiana oleju",
    service_duration_minutes: 30,
    vehicle_license_plate: "WA123456",
    employee_id: "1",
    employee_name: "Jan Kowalski",
    start_ts: "2025-10-27T10:00:00Z",
    end_ts: "2025-10-27T10:30:00Z",
    status: "New",
  },
  {
    id: "2",
    service_id: 2,
    service_name: "Przegląd hamulców",
    service_duration_minutes: 45,
    vehicle_license_plate: "WA654321",
    employee_id: "2",
    employee_name: "Anna Nowak",
    start_ts: "2025-10-27T11:00:00Z",
    end_ts: "2025-10-27T11:45:00Z",
    status: "Done",
  },
];

describe("ReservationsList", () => {
  const mockUseMediaQuery = useMediaQueryModule.useMediaQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render table view on desktop", () => {
    mockUseMediaQuery.mockReturnValue(true); // Desktop view

    render(<ReservationsList reservations={mockReservations} />);

    // Check if table structure exists
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(mockReservations.length + 1); // +1 for header row

    // Check table headers
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Godzina")).toBeInTheDocument();
    expect(screen.getByText("Usługa")).toBeInTheDocument();
    expect(screen.getByText("Pojazd")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Check reservation data
    mockReservations.forEach((reservation) => {
      expect(screen.getByText(reservation.service_name)).toBeInTheDocument();
      expect(screen.getByText(reservation.vehicle_license_plate)).toBeInTheDocument();
    });
  });

  it("should render card view on mobile", () => {
    mockUseMediaQuery.mockReturnValue(false); // Mobile view

    render(<ReservationsList reservations={mockReservations} />);

    // Check if cards container exists
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(mockReservations.length);

    // Check reservation data in cards
    mockReservations.forEach((reservation) => {
      expect(screen.getByText(reservation.service_name)).toBeInTheDocument();
      expect(screen.getByText(reservation.vehicle_license_plate)).toBeInTheDocument();
    });
  });

  it("should format dates correctly", () => {
    mockUseMediaQuery.mockReturnValue(true); // Desktop view

    render(<ReservationsList reservations={mockReservations} />);

    // Check if dates are formatted correctly
    expect(screen.getByText("27.10.2025")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("should display status badges with correct variants", () => {
    mockUseMediaQuery.mockReturnValue(true); // Desktop view

    render(<ReservationsList reservations={mockReservations} />);

    // Check status badges
    const newStatusBadge = screen.getByText("Nowa");
    const doneStatusBadge = screen.getByText("Zakończona");

    expect(newStatusBadge).toHaveClass("bg-primary");
    expect(doneStatusBadge).toHaveClass("bg-secondary");
  });

  it("should handle empty reservations list", () => {
    mockUseMediaQuery.mockReturnValue(true); // Desktop view

    render(<ReservationsList reservations={[]} />);

    // Check if empty table is rendered
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1); // Only header row
  });
});
