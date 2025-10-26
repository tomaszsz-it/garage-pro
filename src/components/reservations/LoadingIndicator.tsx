import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function LoadingIndicator() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div 
      role="status" 
      aria-label="Ładowanie zawartości"
      className="space-y-6"
    >
      {/* Filter Panel Skeleton */}
      <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {isDesktop ? (
        // Table Skeleton
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-32" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Cards Skeleton
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-card p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}