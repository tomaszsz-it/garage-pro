import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthRedirect } from "../useAuthRedirect";

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.location
const mockLocation = {
  href: "",
};

// Setup global mocks before importing the hook
Object.defineProperty(global, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

Object.defineProperty(global, "window", {
  value: {
    location: mockLocation,
  },
  writable: true,
});

describe("useAuthRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAuthAndRedirect", () => {
    it("should redirect to login when response URL contains login path", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      const pendingBookingState = {
        selectedService: { id: 1, name: "Oil Change" },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z" },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse, pendingBookingState);
      });

      expect(shouldRedirect).toBe(true);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith("pendingBooking", JSON.stringify(pendingBookingState));
      expect(mockLocation.href).toBe("/auth/login");
    });

    it("should redirect to login when response status is 401", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse);
      });

      expect(shouldRedirect).toBe(true);
      expect(mockLocation.href).toBe("/auth/login");
    });

    it("should redirect when content-type is not JSON (HTML login page)", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 200,
        headers: new Headers({ "content-type": "text/html" }),
      } as Response;

      const pendingBookingState = {
        selectedService: { id: 1, name: "Oil Change" },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z" },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse, pendingBookingState);
      });

      expect(shouldRedirect).toBe(true);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith("pendingBooking", JSON.stringify(pendingBookingState));
      expect(mockLocation.href).toBe("/auth/login");
    });

    it("should redirect when content-type header is missing", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 200,
        headers: new Headers(),
      } as Response;

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse);
      });

      expect(shouldRedirect).toBe(true);
      expect(mockLocation.href).toBe("/auth/login");
    });

    it("should not redirect for valid JSON responses", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse);
      });

      expect(shouldRedirect).toBe(false);
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe("");
    });

    it("should not save pending booking state when not provided", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      await act(async () => {
        await result.current.checkAuthAndRedirect(mockResponse);
      });

      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe("/auth/login");
    });

    it("should handle content-type with charset parameter", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 200,
        headers: new Headers({ "content-type": "application/json; charset=utf-8" }),
      } as Response;

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse);
      });

      expect(shouldRedirect).toBe(false);
    });

    it("should redirect when content-type is uppercase (case sensitive)", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 200,
        headers: new Headers({ "Content-Type": "APPLICATION/JSON" }),
      } as Response;

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse);
      });

      // Should redirect because the check is case-sensitive and looks for lowercase "application/json"
      expect(shouldRedirect).toBe(true);
      expect(mockLocation.href).toBe("/auth/login");
    });
  });

  describe("getPendingBooking", () => {
    it("should return parsed booking state from sessionStorage", () => {
      const { result } = renderHook(() => useAuthRedirect());

      const pendingBooking = {
        selectedService: { id: 1, name: "Oil Change" },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z" },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(pendingBooking));

      let bookingState: any;

      act(() => {
        bookingState = result.current.getPendingBooking();
      });

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith("pendingBooking");
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("pendingBooking");
      expect(bookingState).toEqual(pendingBooking);
    });

    it("should return null when no pending booking exists", () => {
      const { result } = renderHook(() => useAuthRedirect());

      mockSessionStorage.getItem.mockReturnValue(null);

      let bookingState: any;

      act(() => {
        bookingState = result.current.getPendingBooking();
      });

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith("pendingBooking");
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
      expect(bookingState).toBeNull();
    });

    it("should handle invalid JSON and return null", () => {
      const { result } = renderHook(() => useAuthRedirect());

      mockSessionStorage.getItem.mockReturnValue("invalid-json{");

      let bookingState: any;

      act(() => {
        bookingState = result.current.getPendingBooking();
      });

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith("pendingBooking");
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("pendingBooking");
      expect(bookingState).toBeNull();
    });

    it("should clean up sessionStorage even when JSON parsing fails", () => {
      const { result } = renderHook(() => useAuthRedirect());

      mockSessionStorage.getItem.mockReturnValue("malformed json");

      act(() => {
        result.current.getPendingBooking();
      });

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("pendingBooking");
    });

    it("should handle empty string from sessionStorage", () => {
      const { result } = renderHook(() => useAuthRedirect());

      mockSessionStorage.getItem.mockReturnValue("");

      let bookingState: any;

      act(() => {
        bookingState = result.current.getPendingBooking();
      });

      expect(bookingState).toBeNull();
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe("Hook Stability", () => {
    it("should provide stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() => useAuthRedirect());

      const initialFunctions = {
        checkAuthAndRedirect: result.current.checkAuthAndRedirect,
        getPendingBooking: result.current.getPendingBooking,
      };

      // Force re-render
      rerender();

      expect(result.current.checkAuthAndRedirect).toBe(initialFunctions.checkAuthAndRedirect);
      expect(result.current.getPendingBooking).toBe(initialFunctions.getPendingBooking);
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete auth redirect flow", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const pendingBookingState = {
        selectedService: { id: 1, name: "Oil Change" },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z" },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      // Simulate auth redirect
      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      await act(async () => {
        await result.current.checkAuthAndRedirect(mockResponse, pendingBookingState);
      });

      // Verify state was saved
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith("pendingBooking", JSON.stringify(pendingBookingState));

      // Simulate returning from login
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(pendingBookingState));

      let retrievedState: any;

      act(() => {
        retrievedState = result.current.getPendingBooking();
      });

      expect(retrievedState).toEqual(pendingBookingState);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("pendingBooking");
    });

    it("should handle multiple auth redirects without overwriting", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const firstBookingState = {
        selectedService: { id: 1, name: "Oil Change" },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z" },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      const secondBookingState = {
        selectedService: { id: 2, name: "Brake Check" },
        selectedSlot: { start_ts: "2025-11-16T14:00:00Z" },
        returnUrl: "/reservations/available",
        step: "calendar",
      };

      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      // First redirect
      await act(async () => {
        await result.current.checkAuthAndRedirect(mockResponse, firstBookingState);
      });

      // Second redirect (should overwrite)
      await act(async () => {
        await result.current.checkAuthAndRedirect(mockResponse, secondBookingState);
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2);
      expect(mockSessionStorage.setItem).toHaveBeenLastCalledWith("pendingBooking", JSON.stringify(secondBookingState));
    });
  });

  describe("Edge Cases", () => {
    it("should handle response with null headers", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/api/vehicles",
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as Response;

      let shouldRedirect: boolean;

      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse);
      });

      expect(shouldRedirect).toBe(true);
    });

    it("should handle very large pending booking state", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const largePendingState = {
        selectedService: { id: 1, name: "Oil Change", description: "A".repeat(1000) },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z", employee_name: "B".repeat(500) },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
        additionalData: new Array(100).fill("large-data-item"),
      };

      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      await act(async () => {
        await result.current.checkAuthAndRedirect(mockResponse, largePendingState);
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith("pendingBooking", JSON.stringify(largePendingState));
    });

    it("should handle sessionStorage quota exceeded error", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const pendingBookingState = {
        selectedService: { id: 1, name: "Oil Change" },
        selectedSlot: { start_ts: "2025-11-15T10:00:00Z" },
        returnUrl: "/reservations/available",
        step: "booking-confirmation",
      };

      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      // Should not throw error - the error should be caught and handled gracefully
      let shouldRedirect: boolean;
      await act(async () => {
        shouldRedirect = await result.current.checkAuthAndRedirect(mockResponse, pendingBookingState);
      });

      expect(shouldRedirect).toBe(true);
      expect(mockLocation.href).toBe("/auth/login");
    });
  });

  describe("Type Safety", () => {
    it("should handle undefined pending booking state", async () => {
      const { result } = renderHook(() => useAuthRedirect());

      const mockResponse = {
        url: "http://localhost/auth/login",
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response;

      await act(async () => {
        await result.current.checkAuthAndRedirect(mockResponse, undefined);
      });

      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe("/auth/login");
    });

    it("should return correct types from getPendingBooking", () => {
      const { result } = renderHook(() => useAuthRedirect());

      mockSessionStorage.getItem.mockReturnValue(null);

      let bookingState: any;

      act(() => {
        bookingState = result.current.getPendingBooking();
      });

      expect(bookingState).toBeNull();
      expect(typeof bookingState).toBe("object"); // null is of type object in JS
    });
  });
});
