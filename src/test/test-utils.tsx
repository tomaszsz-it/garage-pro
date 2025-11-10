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
  id: '1',
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  license_plate: 'ABC-123',
  vin: '1234567890ABCDEFG',
  owner_name: 'Jan Kowalski',
  owner_phone: '+48123456789',
  owner_email: 'jan.kowalski@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockReservation = (overrides = {}) => ({
  id: '1',
  vehicle_id: '1',
  customer_name: 'Jan Kowalski',
  customer_phone: '+48123456789',
  customer_email: 'jan.kowalski@example.com',
  service_type: 'oil_change',
  scheduled_date: new Date().toISOString(),
  status: 'scheduled',
  notes: 'Regular maintenance',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
