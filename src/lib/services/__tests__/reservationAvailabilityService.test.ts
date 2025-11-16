import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAvailableReservations } from "../reservationAvailabilityService";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../../errors/database.error";
import { createMockSupabaseClient } from "../../../test/supabase-mocks";

// Interface for mock query builder
interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  eq?: ReturnType<typeof vi.fn>;
  single?: ReturnType<typeof vi.fn>;
  gte?: ReturnType<typeof vi.fn>;
  lte?: ReturnType<typeof vi.fn>;
  lt?: ReturnType<typeof vi.fn>;
  gt?: ReturnType<typeof vi.fn>;
  neq?: ReturnType<typeof vi.fn>;
  then?: <T>(onResolve: (value: unknown) => T) => Promise<T>;
  catch?: <T>(onReject: (error: unknown) => T) => Promise<T>;
}

describe("reservationAvailabilityService", () => {
  // Mock data
  const mockService = {
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

  // Create mock Supabase client for each test
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient() as SupabaseClient;
    vi.clearAllMocks();
  });

  it("should return available slots when service exists", async () => {
    // Mock the from method to return different promises for different tables
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockService,
            error: null,
          }),
        } as unknown as MockQueryBuilder;
      }

      if (table === "employee_schedules") {
        const query = {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: mockEmployeeSchedules,
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: mockEmployeeSchedules,
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      if (table === "reservations") {
        const query = {
          select: vi.fn().mockReturnThis(),
          lt: vi.fn().mockReturnThis(),
          gt: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: mockReservations,
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: mockReservations,
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      return {} as unknown as MockQueryBuilder;
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
    // Setup mocks - only service lookup fails
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Service not found" },
          }),
        } as unknown as MockQueryBuilder;
      }
      return {} as unknown as MockQueryBuilder;
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
    // Mock the from method to return different promises for different tables
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockService,
            error: null,
          }),
        } as unknown as MockQueryBuilder;
      }

      if (table === "employee_schedules") {
        const query = {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty schedules
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty schedules
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      if (table === "reservations") {
        const query = {
          select: vi.fn().mockReturnThis(),
          lt: vi.fn().mockReturnThis(),
          gt: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty reservations
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty reservations
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      return {} as unknown as MockQueryBuilder;
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
    // Mock the from method to return different promises for different tables
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockService,
            error: null,
          }),
        } as unknown as MockQueryBuilder;
      }

      if (table === "employee_schedules") {
        const query = {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: mockEmployeeSchedules,
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: mockEmployeeSchedules,
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      if (table === "reservations") {
        const query = {
          select: vi.fn().mockReturnThis(),
          lt: vi.fn().mockReturnThis(),
          gt: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty reservations
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty reservations
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      return {} as unknown as MockQueryBuilder;
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

  it("should eliminate duplicate time slots from multiple employees", async () => {
    // Mock multiple employees with same time slots
    const mockMultipleEmployeeSchedules = [
      {
        start_ts: "2025-10-23T09:00:00Z",
        end_ts: "2025-10-23T17:00:00Z",
        employee_id: "emp1",
        employees: { name: "John Doe" },
      },
      {
        start_ts: "2025-10-23T09:00:00Z",
        end_ts: "2025-10-23T17:00:00Z",
        employee_id: "emp2",
        employees: { name: "Jane Smith" },
      },
      {
        start_ts: "2025-10-23T09:00:00Z",
        end_ts: "2025-10-23T17:00:00Z",
        employee_id: "emp3",
        employees: { name: "Bob Wilson" },
      },
    ];

    // Mock the from method to return different promises for different tables
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockService,
            error: null,
          }),
        } as unknown as MockQueryBuilder;
      }

      if (table === "employee_schedules") {
        const query = {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: mockMultipleEmployeeSchedules,
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: mockMultipleEmployeeSchedules,
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      if (table === "reservations") {
        const query = {
          select: vi.fn().mockReturnThis(),
          lt: vi.fn().mockReturnThis(),
          gt: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
        };
        // Add promise methods to make it awaitable
        Object.assign(query, {
          then: <T>(onResolve: (value: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty reservations
              error: null,
            }).then(onResolve),
          catch: <T>(onReject: (error: unknown) => T) =>
            Promise.resolve({
              data: [], // Empty reservations
              error: null,
            }).catch(onReject),
        });
        return query as unknown as MockQueryBuilder;
      }

      return {} as unknown as MockQueryBuilder;
    });

    // Test params
    const params = {
      service_id: 1,
      start_ts: "2025-10-23T09:00:00Z",
      end_ts: "2025-10-23T17:00:00Z",
    };

    // Execute
    const result = await getAvailableReservations(params, mockSupabase);

    // Verify no duplicate time slots
    const timeSlots = result.map((slot) => slot.start_ts);
    const uniqueTimeSlots = [...new Set(timeSlots)];

    expect(timeSlots.length).toBe(uniqueTimeSlots.length);

    // Verify we get unique time slots (should be 16 slots: 9:00-17:00 with 30min intervals)
    // But only one slot per time, not 3x duplicates
    const expectedSlots = 16; // (17:00 - 9:00) * 60 / 30 = 16 slots
    expect(result.length).toBe(expectedSlots);

    // Verify first slot is from first available employee (emp1)
    expect(result[0].employee_id).toBe("emp1");
    expect(result[0].employee_name).toBe("John Doe");
  });
});
