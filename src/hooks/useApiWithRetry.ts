import { useState, useCallback } from "react";
import { useAuthRedirect } from "./useAuthRedirect";
import type { ServiceDto, AvailableReservationViewModel } from "../types";

interface ApiCallOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  maxRetries?: number;
  retryDelay?: number;
}

interface PendingBookingState {
  selectedService: ServiceDto | null;
  selectedSlot: AvailableReservationViewModel | null;
  returnUrl: string;
  step: string;
}

export const useApiWithRetry = () => {
  const { checkAuthAndRedirect } = useAuthRedirect();
  const [retryCount, setRetryCount] = useState(0);

  const makeApiCall = useCallback(
    async (url: string, options: ApiCallOptions = {}, pendingBookingState?: PendingBookingState) => {
      const { method = "GET", body, headers = {}, maxRetries = 3, retryDelay = 1000 } = options;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (body) {
        fetchOptions.body = body;
      }

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, fetchOptions);

          // Check for auth redirect
          const shouldRedirect = await checkAuthAndRedirect(response, pendingBookingState);
          if (shouldRedirect) {
            return null;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
          }

          // Reset retry count on success
          setRetryCount(0);
          return response;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Unknown error");

          // Don't retry on the last attempt
          if (attempt < maxRetries) {
            setRetryCount(attempt + 1);
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          }
        }
      }

      throw lastError;
    },
    [checkAuthAndRedirect]
  );

  const retry = useCallback(async <T>(lastFailedCall: () => Promise<T>): Promise<T> => {
    setRetryCount(0);
    return await lastFailedCall();
  }, []);

  return {
    makeApiCall,
    retry,
    retryCount,
  };
};
