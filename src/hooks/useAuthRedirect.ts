import { useCallback } from "react";

interface PendingBookingState {
  selectedService: any;
  selectedSlot: any;
  returnUrl: string;
  step: string;
}

export const useAuthRedirect = () => {
  const checkAuthAndRedirect = useCallback(
    async (response: Response, pendingBookingState?: PendingBookingState): Promise<boolean> => {
      // Check if we were redirected to login page
      if (response.url.includes("/auth/login") || response.status === 401) {
        if (pendingBookingState) {
          try {
            sessionStorage.setItem("pendingBooking", JSON.stringify(pendingBookingState));
          } catch {
            // Ignore sessionStorage errors (e.g., quota exceeded)
          }
        }
        window.location.href = "/auth/login";
        return true;
      }

      // Check if response is HTML (login page) instead of JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (pendingBookingState) {
          try {
            sessionStorage.setItem("pendingBooking", JSON.stringify(pendingBookingState));
          } catch {
            // Ignore sessionStorage errors (e.g., quota exceeded)
          }
        }
        window.location.href = "/auth/login";
        return true;
      }

      return false;
    },
    []
  );

  const getPendingBooking = useCallback(() => {
    const pendingBooking = sessionStorage.getItem("pendingBooking");
    if (pendingBooking) {
      try {
        const bookingState = JSON.parse(pendingBooking);
        sessionStorage.removeItem("pendingBooking");
        return bookingState;
      } catch {
        sessionStorage.removeItem("pendingBooking");
        return null;
      }
    }
    return null;
  }, []);

  return {
    checkAuthAndRedirect,
    getPendingBooking,
  };
};
