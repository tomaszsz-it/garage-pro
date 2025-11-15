import React from "react";

interface RecommendationSectionProps {
  recommendationText: string;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({ recommendationText }) => {
  const hasRecommendation = recommendationText && recommendationText.trim().length > 0;

  return (
    <div
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6"
      role="region"
      aria-labelledby="ai-recommendations-title"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0" aria-hidden="true">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 id="ai-recommendations-title" className="text-lg font-semibold text-gray-900 mb-2">
            Rekomendacje serwisowe AI
          </h3>

          {hasRecommendation ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-white rounded-md p-4 border border-blue-100 max-h-64 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{recommendationText}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-md p-4 border border-blue-100">
              <p className="text-gray-500 italic">
                Rekomendacja niedostępna. Skontaktuj się z mechanikiem w celu uzyskania dodatkowych informacji.
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            <p>
              💡 Rekomendacje zostały wygenerowane automatycznie na podstawie danych Twojego pojazdu i wybranej usługi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
