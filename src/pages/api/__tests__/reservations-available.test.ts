import { describe, it, expect, vi } from 'vitest';
import { GET } from '../reservations/available';
import type { APIContext } from 'astro';

describe('GET /reservations/available', () => {
  // Mock data
  const mockSession = {
    data: {
      session: {
        user: { id: 'test-user' }
      }
    }
  };

  // Mock Supabase client
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue(mockSession)
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-23T08:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return available slots for a valid service', async () => {
    // Mock successful service lookup
    vi.spyOn(mockSupabase, 'single').mockResolvedValueOnce({
      data: { duration_minutes: 30 },
      error: null
    });

    // Mock successful schedules and reservations lookup
    vi.spyOn(mockSupabase, 'select')
      .mockResolvedValueOnce({
        data: [
          {
            start_ts: '2025-10-23T09:00:00Z',
            end_ts: '2025-10-23T17:00:00Z',
            employee_id: 'emp1',
            employees: { name: 'John Doe' }
          }
        ],
        error: null
      })
      .mockResolvedValueOnce({
        data: [],
        error: null
      });

    const context = {
      request: new Request('http://localhost/api/reservations/available?service_id=1'),
      locals: { supabase: mockSupabase }
    } as unknown as APIContext;

    const response = await GET(context);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data[0]).toMatchObject({
      employee_id: expect.any(String),
      employee_name: expect.any(String),
      start_ts: expect.any(String),
      end_ts: expect.any(String)
    });
  });
});
