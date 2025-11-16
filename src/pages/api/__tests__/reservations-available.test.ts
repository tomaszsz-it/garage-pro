import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { APIContext } from "astro";
import { createMockSupabaseClient } from "../../../test/supabase-mocks";

// Mock the Supabase client module
vi.mock("../../../db/supabase.client.ts", () => ({
  DEFAULT_USER_ID: "test-user-id",
  supabaseClient: createMockSupabaseClient(),
  createSupabaseServerInstance: vi.fn(() => createMockSupabaseClient()),
}));

// Mock the service before importing the API route
vi.mock("../../../lib/services/reservationAvailabilityService", () => ({
  getAvailableReservations: vi.fn(),
}));

// Mock the validation schema
vi.mock("../../../lib/validation/reservationAvailabilitySchema", () => ({
  availableReservationsQuerySchema: {
    safeParse: vi.fn(),
  },
}));

const { GET } = await import("../reservations/available");

describe("GET /reservations/available", () => {
  // Mock data
  const mockSession = {
    data: {
      session: {
        user: { id: "test-user" },
      },
    },
  };

  // Mock Supabase client
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockQueryBuilder: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    lte: ReturnType<typeof vi.fn>;
    neq: ReturnType<typeof vi.fn>;
    gt: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();

    // Create a mock query builder that can be reused
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    // Mock auth methods
    mockSupabase.auth.getSession = vi.fn().mockResolvedValue(mockSession);
    vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder);

    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-10-23T08:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return available slots for a valid service", async () => {
    // Import the mocked functions
    const { getAvailableReservations } = await import("../../../lib/services/reservationAvailabilityService");
    const { availableReservationsQuerySchema } = await import("../../../lib/validation/reservationAvailabilitySchema");

    // Mock validation success
    vi.mocked(availableReservationsQuerySchema.safeParse).mockReturnValue({
      success: true,
      data: {
        service_id: 1,
        start_ts: "2025-10-23T09:00:00Z",
        end_ts: "2025-10-23T17:00:00Z",
      },
    });

    // Mock service response
    vi.mocked(getAvailableReservations).mockResolvedValue([
      {
        start_ts: "2025-10-23T09:00:00Z",
        end_ts: "2025-10-23T09:30:00Z",
        employee_id: "emp1",
        employee_name: "John Doe",
      },
    ]);

    const context = {
      request: new Request("http://localhost/api/reservations/available?service_id=1"),
      locals: { supabase: mockSupabase },
    } as unknown as APIContext;

    const response = await GET(context);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data[0]).toMatchObject({
      employee_id: expect.any(String),
      employee_name: expect.any(String),
      start_ts: expect.any(String),
      end_ts: expect.any(String),
    });
  });
});
