import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorNotificationProps {
  onRetry: () => void;
}

export function ErrorNotification({ onRetry }: ErrorNotificationProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-destructive/10 text-destructive p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] text-center border border-destructive/20 shadow-[var(--elevation-4)] animate-[fadeIn_300ms_ease-out]"
    >
      <div className="flex justify-center mb-[var(--spacing-lg)] p-[var(--spacing-lg)] bg-destructive/5 rounded-full w-fit mx-auto">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-[var(--font-size-title-3)] font-[var(--font-weight-semibold)] mb-[var(--spacing-sm)] text-destructive">
        Nie udało się załadować rezerwacji
      </h2>
      <p className="text-[var(--font-size-body)] font-[var(--font-weight-regular)] text-[var(--neutral-70)] mb-[var(--spacing-2xl)] leading-[var(--line-height-body)]">
        Wystąpił problem podczas ładowania danych. Spróbuj ponownie lub odśwież stronę.
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="bg-background hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-150 ease-out shadow-[var(--elevation-2)] hover:shadow-[var(--elevation-4)]"
      >
        Spróbuj ponownie
      </Button>
    </div>
  );
}
