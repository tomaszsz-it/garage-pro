import { describe, it, expect, vi } from "vitest";
import { GET } from "../reservations/available";
import type { APIContext } from "astro";
import { createMockSupabaseClient } from "../../../test/supabase-mocks";

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
  let mockSupabase: any;
  let mockQueryBuilder: any;

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
    // Mock successful queries - single() calls in order: service, schedules, reservations
    mockQueryBuilder.single
      .mockResolvedValueOnce({ // Service lookup
        data: { duration_minutes: 30 },
        error: null,
      })
      .mockResolvedValueOnce({ // Schedules lookup
        data: [
          {
            start_ts: "2025-10-23T09:00:00Z",
            end_ts: "2025-10-23T17:00:00Z",
            employee_id: "emp1",
            employees: { name: "John Doe" },
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({ // Reservations lookup (empty)
        data: [],
        error: null,
      });

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
