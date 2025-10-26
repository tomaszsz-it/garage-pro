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
      className="bg-destructive/10 text-destructive p-6 rounded-lg text-center"
    >
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        Nie udało się załadować rezerwacji
      </h2>
      <p className="text-muted-foreground mb-6">
        Wystąpił problem podczas ładowania danych. Spróbuj ponownie lub odśwież stronę.
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="bg-background hover:bg-accent"
      >
        Spróbuj ponownie
      </Button>
    </div>
  );
}
