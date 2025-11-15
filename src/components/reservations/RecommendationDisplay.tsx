import { Lightbulb } from "lucide-react";

interface RecommendationDisplayProps {
  recommendation: string;
}

export function RecommendationDisplay({ recommendation }: RecommendationDisplayProps) {
  // Don't render if no recommendation
  if (!recommendation || recommendation.trim() === "") {
    return null;
  }

  // Split recommendation into lines for better formatting
  const lines = recommendation.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Rekomendacje AI</h3>
          <div className="space-y-2">
            {lines.map((line, index) => (
              <p key={index} className="text-sm text-blue-800 leading-relaxed">
                {line.trim()}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-600">
          💡 Rekomendacje wygenerowane przez sztuczną inteligencję na podstawie danych pojazdu i wybranej usługi.
        </p>
      </div>
    </div>
  );
}
