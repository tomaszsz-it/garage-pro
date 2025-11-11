import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* Add your providers here, e.g., ThemeProvider, QueryClient, etc. */}
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock factories for common external services
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    then: vi.fn(),
  })),
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
});

// Mock user event for realistic interactions
export const createMockUserEvent = () => {
  const userEvent = {
    click: vi.fn(),
    type: vi.fn(),
    clear: vi.fn(),
    selectOptions: vi.fn(),
    keyboard: vi.fn(),
    hover: vi.fn(),
    unhover: vi.fn(),
  };
  return userEvent;
};

// Mock data factories
export const createMockVehicle = (overrides = {}) => ({
  license_plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Camry',
  production_year: 2023,
  vin: '1234567890ABCDEFG',
  car_type: 'Sedan',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockService = (overrides = {}) => ({
  id: 1,
  name: 'Oil Change',
  description: 'Regular oil change service',
  duration_minutes: 30,
  price: 50.00,
  is_active: true,
  ...overrides,
});

export const createMockAvailableSlot = (overrides = {}) => ({
  start_ts: '2025-11-15T10:00:00Z',
  end_ts: '2025-11-15T10:30:00Z',
  employee_id: 'emp1',
  employee_name: 'John Mechanic',
  ...overrides,
});

export const createMockReservation = (overrides = {}) => ({
  id: 'res1',
  service_id: 1,
  vehicle_license_plate: 'ABC-123',
  employee_id: 'emp1',
  start_ts: '2025-11-15T10:00:00Z',
  end_ts: '2025-11-15T10:30:00Z',
  status: 'scheduled' as const,
  created_at: new Date().toISOString(),
  service_name: 'Oil Change',
  service_duration_minutes: 30,
  employee_name: 'John Mechanic',
  recommendation_text: 'Regular maintenance',
  ...overrides,
});

export const createMockReservationCreateDto = (overrides = {}) => ({
  service_id: 1,
  vehicle_license_plate: 'ABC-123',
  employee_id: 'emp1',
  start_ts: '2025-11-15T10:00:00Z',
  end_ts: '2025-11-15T10:30:00Z',
  ...overrides,
});

export const createMockBookingState = (overrides = {}) => ({
  selectedService: null,
  selectedDay: null,
  selectedSlot: null,
  selectedVehicle: null,
  slots: [],
  vehicles: [],
  isLoading: false,
  isCreatingReservation: false,
  error: null,
  currentStep: 'service-selection' as const,
  reservationSummary: null,
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
