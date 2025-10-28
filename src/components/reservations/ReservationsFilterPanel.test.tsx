import { render, screen, fireEvent } from "@testing-library/react";
import { ReservationsFilterPanel } from "./ReservationsFilterPanel";
import type { VehicleDto, Service } from "../../types";

const mockVehicles: VehicleDto[] = [
  {
    license_plate: "WA123456",
    brand: "Toyota",
    model: "Corolla",
    production_year: 2020,
    created_at: "2025-10-26T10:00:00Z",
  },
  {
    license_plate: "WA654321",
    brand: "Honda",
    model: "Civic",
    production_year: 2019,
    created_at: "2025-10-26T10:00:00Z",
  },
];

const mockServices: Service[] = [
  {
    service_id: 1,
    name: "Wymiana oleju",
    duration_minutes: 30,
    description: "Wymiana oleju silnikowego wraz z filtrem",
    created_at: "2025-10-26T10:00:00Z",
  },
  {
    service_id: 2,
    name: "Przegląd hamulców",
    duration_minutes: 45,
    description: "Kompleksowy przegląd układu hamulcowego",
    created_at: "2025-10-26T10:00:00Z",
  },
];

describe("ReservationsFilterPanel", () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all filter controls", () => {
    render(
      <ReservationsFilterPanel
        vehicles={mockVehicles}
        services={mockServices}
        filters={{
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        }}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByPlaceholderText("Wybierz pojazd")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Wybierz usługę")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Wybierz status")).toBeInTheDocument();
  });

  it("should display vehicle options", () => {
    render(
      <ReservationsFilterPanel
        vehicles={mockVehicles}
        services={mockServices}
        filters={{
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const vehicleSelect = screen.getByPlaceholderText("Wybierz pojazd");
    fireEvent.click(vehicleSelect);

    mockVehicles.forEach((vehicle) => {
      expect(screen.getByText(`${vehicle.license_plate} - ${vehicle.brand} ${vehicle.model}`)).toBeInTheDocument();
    });
  });

  it("should display service options", () => {
    render(
      <ReservationsFilterPanel
        vehicles={mockVehicles}
        services={mockServices}
        filters={{
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const serviceSelect = screen.getByPlaceholderText("Wybierz usługę");
    fireEvent.click(serviceSelect);

    mockServices.forEach((service) => {
      expect(screen.getByText(service.name)).toBeInTheDocument();
    });
  });

  it("should call onFilterChange when filters are changed", () => {
    render(
      <ReservationsFilterPanel
        vehicles={mockVehicles}
        services={mockServices}
        filters={{
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        }}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Select vehicle
    const vehicleSelect = screen.getByPlaceholderText("Wybierz pojazd");
    fireEvent.change(vehicleSelect, { target: { value: "WA123456" } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleLicensePlate: "WA123456",
      })
    );

    // Select service
    const serviceSelect = screen.getByPlaceholderText("Wybierz usługę");
    fireEvent.change(serviceSelect, { target: { value: "1" } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: 1,
      })
    );
  });

  it("should clear all filters when reset button is clicked", () => {
    render(
      <ReservationsFilterPanel
        vehicles={mockVehicles}
        services={mockServices}
        filters={{
          vehicleLicensePlate: "WA123456",
          serviceId: 1,
          status: "New",
        }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const resetButton = screen.getByText("Wyczyść filtry");
    fireEvent.click(resetButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      vehicleLicensePlate: null,
      serviceId: null,
      status: null,
    });
  });

  it("should disable 'Znajdź termin' button when no vehicles are available", () => {
    render(
      <ReservationsFilterPanel
        vehicles={[]}
        services={mockServices}
        filters={{
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const findTimeButton = screen.getByText("Znajdź termin");
    expect(findTimeButton).toBeDisabled();

    const addVehicleButton = screen.getByText("Dodaj pojazd");
    expect(addVehicleButton).toBeInTheDocument();
  });
});
