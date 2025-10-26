import { renderHook, act } from "@testing-library/react";
import { useReservations } from "../useReservations";
import type { ReservationDto, VehicleDto } from "../../../types";

// Mock fetch
global.fetch = jest.fn();

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

describe("useReservations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/reservations")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockReservations,
              pagination: { page: 1, limit: 10, total: 2 },
            }),
        });
      }
      if (url.includes("/vehicles")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockVehicles,
              pagination: { page: 1, limit: 10, total: 2 },
            }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("should fetch reservations and vehicles on mount", async () => {
    const { result } = renderHook(() =>
      useReservations({
        page: 1,
        filters: {
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        },
      })
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.reservations).toBe(null);
    expect(result.current.vehicles).toBe(null);

    // Wait for data
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Data loaded
    expect(result.current.isLoading).toBe(false);
    expect(result.current.reservations).toHaveLength(2);
    expect(result.current.vehicles).toHaveLength(2);
    expect(result.current.error).toBe(null);
  });

  it("should filter reservations by vehicle", async () => {
    const { result } = renderHook(() =>
      useReservations({
        page: 1,
        filters: {
          vehicleLicensePlate: "WA123456",
          serviceId: null,
          status: null,
        },
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.reservations).toHaveLength(1);
    expect(result.current.reservations?.[0].vehicle_license_plate).toBe("WA123456");
  });

  it("should filter reservations by service", async () => {
    const { result } = renderHook(() =>
      useReservations({
        page: 1,
        filters: {
          vehicleLicensePlate: null,
          serviceId: 1,
          status: null,
        },
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.reservations).toHaveLength(1);
    expect(result.current.reservations?.[0].service_id).toBe(1);
  });

  it("should filter reservations by status", async () => {
    const { result } = renderHook(() =>
      useReservations({
        page: 1,
        filters: {
          vehicleLicensePlate: null,
          serviceId: null,
          status: "Done",
        },
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.reservations).toHaveLength(1);
    expect(result.current.reservations?.[0].status).toBe("Done");
  });

  it("should handle API errors", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    const { result } = renderHook(() =>
      useReservations({
        page: 1,
        filters: {
          vehicleLicensePlate: null,
          serviceId: null,
          status: null,
        },
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle empty results", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
            pagination: { page: 1, limit: 10, total: 0 },
          }),
      })
    );

    const { result } = renderHook(() =>
      useReservations({
        page: 1,
        filters: {
          vehicleLicensePlate: "NONEXISTENT",
          serviceId: null,
          status: null,
        },
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.reservations).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });
});
