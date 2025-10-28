import { renderHook, act } from "@testing-library/react";
import { useReservations } from "../useReservations";

// Mock fetch
global.fetch = jest.fn();

describe("useReservations Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle network errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

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

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Error state
    expect(result.current.error).toEqual(new Error("Network error"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.reservations).toBe(null);
  });

  it("should handle API errors with error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

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

    expect(result.current.error).toEqual(new Error("Failed to fetch reservations"));
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle malformed API response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: "response" }),
    });

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

  it("should handle retry functionality", async () => {
    const mockSuccessResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          pagination: { page: 1, limit: 10, total: 0 },
        }),
    };

    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockSuccessResponse)
      .mockResolvedValueOnce(mockSuccessResponse);

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

    // Wait for initial error
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();

    // Retry
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.reservations).toEqual([]);
  });

  it("should maintain previous data during loading state", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "1",
              user_id: "user-1",
              service_id: 1,
              service_name: "Wymiana oleju",
              service_duration_minutes: 30,
              vehicle_license_plate: "WA123456",
              employee_id: "1",
              employee_name: "Jan Kowalski",
              start_ts: "2025-10-27T10:00:00Z",
              end_ts: "2025-10-27T10:30:00Z",
              status: "New",
              created_at: "2025-10-26T09:00:00Z",
              updated_at: "2025-10-26T09:00:00Z",
              recommendation_text: "Check brakes soon",
            },
          ],
          pagination: { page: 1, limit: 10, total: 1 },
        }),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse)
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100)));

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

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const initialData = result.current.reservations;

    // Trigger reload
    act(() => {
      result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.reservations).toEqual(initialData); // Previous data should be preserved
  });
});
