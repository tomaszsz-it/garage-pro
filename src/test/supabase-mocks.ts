import { vi } from 'vitest';

// Mock Supabase client responses
export const createMockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

// Mock successful responses
export const mockSupabaseSuccess = <T>(data: T) => 
  createMockSupabaseResponse(data, null);

// Mock error responses
export const mockSupabaseError = (message: string) =>
  createMockSupabaseResponse(null, { message });

// Complete Supabase client mock
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    csv: vi.fn(),
    geojson: vi.fn(),
    explain: vi.fn(),
    rollback: vi.fn(),
    returns: vi.fn().mockReturnThis(),
  }));

  const mockAuth = {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    refreshSession: vi.fn(),
    setSession: vi.fn(),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    reauthenticate: vi.fn(),
  };

  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn(),
      createSignedUrl: vi.fn(),
      createSignedUrls: vi.fn(),
      createSignedUploadUrl: vi.fn(),
      updateFileOptions: vi.fn(),
    })),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    storage: mockStorage,
    rpc: vi.fn(),
    schema: vi.fn().mockReturnThis(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    removeAllChannels: vi.fn(),
    getChannels: vi.fn(),
  };
};

// Mock authentication states
export const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  email_confirmed_at: '2023-01-01T00:00:00.000Z',
  last_sign_in_at: '2023-01-01T00:00:00.000Z',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  aud: 'authenticated',
};

export const mockAuthSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600 * 1000,
  token_type: 'bearer',
  user: mockAuthUser,
};

// Mock database types for TypeScript
export type MockVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
};

export type MockReservation = {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};
