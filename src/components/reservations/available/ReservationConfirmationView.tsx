import React from "react";
import type { ReservationDto } from "../../../types";
import { ReservationDetailsCard } from "./ReservationDetailsCard";
import { RecommendationSection } from "./RecommendationSection";
import { ActionButtons } from "./ActionButtons";

interface ReservationConfirmationViewProps {
  reservation: ReservationDto;
  onBackToReservations: () => void;
}

export const ReservationConfirmationView: React.FC<ReservationConfirmationViewProps> = ({
  reservation,
  onBackToReservations,
}) => {
  if (!reservation) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rezerwacja potwierdzona!
        </h1>
        <p className="text-gray-600">
          Twoja rezerwacja została pomyślnie utworzona. Poniżej znajdziesz szczegóły oraz rekomendacje serwisowe.
        </p>
      </div>

      {/* Reservation Details */}
      <ReservationDetailsCard reservation={reservation} />

      {/* AI Recommendation */}
      <RecommendationSection recommendationText={reservation.recommendation_text} />

      {/* Action Buttons */}
      <ActionButtons
        reservationId={reservation.id}
        onBackToReservations={onBackToReservations}
      />
    </div>
  );
};
