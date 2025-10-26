import { render, screen } from "@testing-library/react";
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
];

const mockServices: Service[] = [
  {
    service_id: 1,
    name: "Wymiana oleju",
    duration_minutes: 30,
    description: "Wymiana oleju silnikowego wraz z filtrem",
    created_at: "2025-10-26T10:00:00Z",
  },
];

describe("ReservationsFilterPanel Responsive Design", () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset viewport size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));
  });

  it("should render filters in a row on desktop", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));

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

    const filtersContainer = screen.getByTestId("filters-container");
    expect(filtersContainer).toHaveClass("md:flex-row");
  });

  it("should render filters in a column on mobile", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    window.dispatchEvent(new Event("resize"));

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

    const filtersContainer = screen.getByTestId("filters-container");
    expect(filtersContainer).toHaveClass("flex-col");
  });

  it("should maintain proper spacing between filters on mobile", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    window.dispatchEvent(new Event("resize"));

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

    const filtersContainer = screen.getByTestId("filters-container");
    expect(filtersContainer).toHaveClass("gap-4");
  });

  it("should maintain proper button layout on mobile", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    window.dispatchEvent(new Event("resize"));

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

    const buttonsContainer = screen.getByTestId("buttons-container");
    expect(buttonsContainer).toHaveClass("flex justify-end gap-4");
  });

  it("should maintain proper select width on all screen sizes", () => {
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

    const selects = screen.getAllByRole("combobox");
    selects.forEach((select) => {
      expect(select).toHaveClass("w-full");
    });
  });
});
