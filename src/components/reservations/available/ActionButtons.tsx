import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { toast } from "sonner";

interface ActionButtonsProps {
  reservationId: string;
  onBackToReservations: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ reservationId, onBackToReservations }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyLink = async () => {
    if (!reservationId) return;

    setIsCopying(true);

    try {
      const reservationUrl = `${window.location.origin}/reservations/${reservationId}`;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(reservationUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = reservationUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopySuccess(true);

      // Show success toast
      toast.success("Link do rezerwacji został skopiowany do schowka!", {
        description: "Możesz teraz udostępnić go innym osobom.",
        duration: 3000,
      });

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset success state after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setCopySuccess(false);
        timeoutRef.current = null;
      }, 3000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy link:", error);
      // Show error toast
      toast.error("Nie udało się skopiować linku", {
        description: "Spróbuj ponownie lub skopiuj link ręcznie z paska adresu.",
        duration: 4000,
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-6" role="group" aria-label="Akcje rezerwacji">
      <Button
        onClick={handleCopyLink}
        disabled={isCopying || !reservationId}
        variant="outline"
        className="flex-1 sm:flex-none"
        aria-describedby={copySuccess ? "copy-success-message" : undefined}
      >
        {isCopying ? (
          <>
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Kopiowanie...
          </>
        ) : copySuccess ? (
          <>
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Skopiowano!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Kopiuj link do rezerwacji
          </>
        )}
      </Button>

      <Button onClick={onBackToReservations} className="flex-1">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Przejdź do listy rezerwacji
      </Button>
    </div>
  );
};
