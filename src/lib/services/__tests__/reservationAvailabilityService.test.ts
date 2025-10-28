import { describe, it, expect, vi } from "vitest";
import { getAvailableReservations } from "../reservationAvailabilityService";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../../errors/database.error";

describe("reservationAvailabilityService", () => {
  // Mock data
  const mockService = {
    id: 1,
    duration_minutes: 30,
  };

  const mockEmployeeSchedules = [
    {
      start_ts: "2025-10-23T09:00:00Z",
      end_ts: "2025-10-23T17:00:00Z",
      employee_id: "emp1",
      employees: { name: "John Doe" },
    },
  ];

  const mockReservations = [
    {
      start_ts: "2025-10-23T10:00:00Z",
      end_ts: "2025-10-23T10:30:00Z",
      employee_id: "emp1",
    },
  ];

  // Mock Supabase client
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  } as unknown as SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return available slots when service exists", async () => {
    // Setup mocks
    vi.spyOn(mockSupabase, "single").mockResolvedValueOnce({
      data: mockService,
      error: null,
    });

    vi.spyOn(mockSupabase, "select")
      .mockResolvedValueOnce({
        data: mockEmployeeSchedules,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockReservations,
        error: null,
      });

    // Test params
    const params = {
      service_id: 1,
      start_ts: "2025-10-23T09:00:00Z",
      end_ts: "2025-10-23T17:00:00Z",
    };

    // Execute
    const result = await getAvailableReservations(params, mockSupabase);

    // Verify
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({
      employee_id: "emp1",
      employee_name: "John Doe",
    });

    // Verify slots don't overlap with existing reservation
    const hasOverlap = result.some(
      (slot) => new Date(slot.start_ts).getTime() === new Date("2025-10-23T10:00:00Z").getTime()
    );
    expect(hasOverlap).toBe(false);
  });

  it("should throw DatabaseError when service not found", async () => {
    // Setup mocks
    vi.spyOn(mockSupabase, "single").mockResolvedValueOnce({
      data: null,
      error: { message: "Service not found" },
    });

    // Test params
    const params = {
      service_id: 999,
      start_ts: "2025-10-23T09:00:00Z",
      end_ts: "2025-10-23T17:00:00Z",
    };

    // Execute and verify
    await expect(getAvailableReservations(params, mockSupabase)).rejects.toThrow(DatabaseError);
  });

  it("should handle empty schedules", async () => {
    // Setup mocks
    vi.spyOn(mockSupabase, "single").mockResolvedValueOnce({
      data: mockService,
      error: null,
    });

    vi.spyOn(mockSupabase, "select")
      .mockResolvedValueOnce({
        data: [],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    // Test params
    const params = {
      service_id: 1,
      start_ts: "2025-10-23T09:00:00Z",
      end_ts: "2025-10-23T17:00:00Z",
    };

    // Execute
    const result = await getAvailableReservations(params, mockSupabase);

    // Verify
    expect(result).toEqual([]);
  });

  it("should respect the limit parameter", async () => {
    // Setup mocks
    vi.spyOn(mockSupabase, "single").mockResolvedValueOnce({
      data: mockService,
      error: null,
    });

    vi.spyOn(mockSupabase, "select")
      .mockResolvedValueOnce({
        data: mockEmployeeSchedules,
        error: null,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    // Test params with limit
    const params = {
      service_id: 1,
      start_ts: "2025-10-23T09:00:00Z",
      end_ts: "2025-10-23T17:00:00Z",
      limit: 2,
    };

    // Execute
    const result = await getAvailableReservations(params, mockSupabase);

    // Verify
    expect(result.length).toBeLessThanOrEqual(2);
  });
});
