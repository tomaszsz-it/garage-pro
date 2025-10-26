import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReservationsView } from "./ReservationsView";
import { useReservations } from "./hooks/useReservations";
import type { ReservationDto, VehicleDto } from "../../types";

// Mock the custom hook
jest.mock("./hooks/useReservations");

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
];

const mockVehicles: VehicleDto[] = [
  {
    license_plate: "WA123456",
    brand: "Toyota",
    model: "Corolla",
    production_year: 2020,
    created_at: "2025-10-26T10:00:00Z",
  },
];

describe("ReservationsView", () => {
  const mockUseReservations = useReservations as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockUseReservations.mockReturnValue({
      reservations: null,
      vehicles: null,
      services: [],
      isLoading: true,
      error: null,
      pagination: null,
      refetch: jest.fn(),
    });

    render(<ReservationsView />);
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("should show error state with retry button", async () => {
    const mockRefetch = jest.fn();
    mockUseReservations.mockReturnValue({
      reservations: null,
      vehicles: null,
      services: [],
      isLoading: false,
      error: new Error("Failed to fetch data"),
      pagination: null,
      refetch: mockRefetch,
    });

    render(<ReservationsView />);
    
    expect(screen.getByText("Failed to load reservations")).toBeInTheDocument();
    
    const retryButton = screen.getByText("Try Again");
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should show empty state when no reservations exist", () => {
    mockUseReservations.mockReturnValue({
      reservations: [],
      vehicles: mockVehicles,
      services: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0 },
      refetch: jest.fn(),
    });

    render(<ReservationsView />);
    
    expect(screen.getByText("No Reservations Found")).toBeInTheDocument();
    expect(screen.getByText("You don't have any reservations yet. Would you like to schedule one?")).toBeInTheDocument();
    
    const findTimeButton = screen.getByText("Find Available Time");
    expect(findTimeButton).not.toHaveClass("opacity-50");
  });

  it("should show empty state with disabled button when no vehicles exist", () => {
    mockUseReservations.mockReturnValue({
      reservations: [],
      vehicles: [],
      services: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0 },
      refetch: jest.fn(),
    });

    render(<ReservationsView />);
    
    const findTimeButton = screen.getByText("Find Available Time");
    expect(findTimeButton).toHaveClass("opacity-50");
    expect(findTimeButton).toHaveAttribute("aria-disabled", "true");
    
    const addVehicleButton = screen.getByText("Add Vehicle");
    expect(addVehicleButton).toBeInTheDocument();
  });

  it("should show empty state when filters return no results", () => {
    mockUseReservations.mockReturnValue({
      reservations: [],
      vehicles: mockVehicles,
      services: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0 },
      refetch: jest.fn(),
    });

    render(<ReservationsView />);
    
    // Simulate filter change
    const filterPanel = screen.getByTestId("filter-panel");
    fireEvent.change(filterPanel, {
      target: { value: "nonexistent-vehicle" },
    });

    expect(screen.getByText("No reservations match your filters. Try adjusting your search criteria.")).toBeInTheDocument();
  });

  it("should handle navigation to reservation details", async () => {
    mockUseReservations.mockReturnValue({
      reservations: mockReservations,
      vehicles: mockVehicles,
      services: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 1 },
      refetch: jest.fn(),
    });

    render(<ReservationsView />);

    // Find and click a reservation item
    const reservationItem = screen.getByText("Wymiana oleju").closest("tr, div");
    expect(reservationItem).toBeInTheDocument();
    
    if (reservationItem) {
      fireEvent.click(reservationItem);
      expect(window.location.href).toContain("/reservations/1");
    }
  });

  it("should handle page navigation", () => {
    const mockSetPage = jest.fn();
    mockUseReservations.mockReturnValue({
      reservations: mockReservations,
      vehicles: mockVehicles,
      services: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 20 },
      refetch: jest.fn(),
    });

    render(<ReservationsView />);

    // Find and click next page button
    const nextPageButton = screen.getByLabelText("Go to next page");
    fireEvent.click(nextPageButton);

    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("should reset pagination when filters change", async () => {
    const mockSetPage = jest.fn();
    mockUseReservations.mockReturnValue({
      reservations: mockReservations,
      vehicles: mockVehicles,
      services: [],
      isLoading: false,
      error: null,
      pagination: { page: 2, limit: 10, total: 20 },
      refetch: jest.fn(),
    });

    render(<ReservationsView />);

    // Change filter
    const filterPanel = screen.getByTestId("filter-panel");
    fireEvent.change(filterPanel, {
      target: { value: "WA123456" },
    });

    await waitFor(() => {
      expect(mockSetPage).toHaveBeenCalledWith(1);
    });
  });
});
