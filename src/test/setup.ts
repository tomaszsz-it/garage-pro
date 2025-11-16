import "@testing-library/jest-dom";
import { expect, beforeAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Extend expect with jest-dom matchers
expect.extend({});

// Global test setup
beforeAll(() => {
  // Setup environment variables for tests
  process.env.SUPABASE_URL = "https://fake.supabase.co";
  process.env.SUPABASE_KEY = "fake-test-anon-key";

  // Setup global mocks
  setupGlobalMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Global mocks setup
function setupGlobalMocks() {
  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock HTMLElement.scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();

  // Mock console methods in tests (to avoid noise)
  global.console = {
    ...console,
    // Uncomment to silence console in tests
    // log: vi.fn(),
    // warn: vi.fn(),
    // error: vi.fn(),
  };

  // Mock fetch if not using MSW
  global.fetch = vi.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });
}

// Custom matchers
expect.extend({
  toHaveNoConsoleErrors() {
    const consoleSpy = vi.spyOn(console, "error");
    const pass = consoleSpy.mock.calls.length === 0;

    return {
      pass,
      message: () =>
        pass
          ? "Expected console.error to be called"
          : `Expected no console.error calls, but got ${consoleSpy.mock.calls.length}`,
    };
  },
});

// Type declarations for custom matchers
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveNoConsoleErrors(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoConsoleErrors(): unknown;
  }
}
