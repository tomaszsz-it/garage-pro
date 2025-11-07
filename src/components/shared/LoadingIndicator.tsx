import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function LoadingIndicator() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      role="status"
      aria-label="Ładowanie zawartości"
      className="space-y-[var(--spacing-2xl)] animate-[fadeIn_300ms_ease-out]"
    >
      {/* Action Panel Skeleton */}
      <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]">
        <div className="flex justify-between items-center">
          <Skeleton className="h-[2.5rem] w-[12rem]" />
          <Skeleton className="h-[2.5rem] w-[8rem]" />
        </div>
      </div>

      {isDesktop ? (
        // Table Skeleton
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--neutral-30)] bg-card shadow-[var(--elevation-2)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--neutral-30)]">
                <th className="p-[var(--spacing-lg)] text-left">
                  <Skeleton className="h-[1.25rem] w-[8rem]" />
                </th>
                <th className="p-[var(--spacing-lg)] text-left">
                  <Skeleton className="h-[1.25rem] w-[6rem]" />
                </th>
                <th className="p-[var(--spacing-lg)] text-left">
                  <Skeleton className="h-[1.25rem] w-[6rem]" />
                </th>
                <th className="p-[var(--spacing-lg)] text-left">
                  <Skeleton className="h-[1.25rem] w-[4rem]" />
                </th>
                <th className="p-[var(--spacing-lg)] text-left">
                  <Skeleton className="h-[1.25rem] w-[6rem]" />
                </th>
                <th className="p-[var(--spacing-lg)] text-left">
                  <Skeleton className="h-[1.25rem] w-[5rem]" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-[var(--neutral-20)]">
                  <td className="p-[var(--spacing-lg)]">
                    <Skeleton className="h-[1.25rem] w-[7rem]" />
                  </td>
                  <td className="p-[var(--spacing-lg)]">
                    <Skeleton className="h-[1.25rem] w-[5rem]" />
                  </td>
                  <td className="p-[var(--spacing-lg)]">
                    <Skeleton className="h-[1.25rem] w-[5rem]" />
                  </td>
                  <td className="p-[var(--spacing-lg)]">
                    <Skeleton className="h-[1.25rem] w-[3rem]" />
                  </td>
                  <td className="p-[var(--spacing-lg)]">
                    <Skeleton className="h-[1.25rem] w-[10rem]" />
                  </td>
                  <td className="p-[var(--spacing-lg)]">
                    <div className="flex gap-[var(--spacing-sm)]">
                      <Skeleton className="h-[2rem] w-[4rem]" />
                      <Skeleton className="h-[2rem] w-[4rem]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Card Skeleton for mobile
        <div className="space-y-[var(--spacing-lg)]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)] space-y-[var(--spacing-lg)]"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-[var(--spacing-sm)]">
                  <Skeleton className="h-[1.5rem] w-[8rem]" />
                  <Skeleton className="h-[1rem] w-[12rem]" />
                </div>
                <div className="flex gap-[var(--spacing-sm)]">
                  <Skeleton className="h-[2rem] w-[4rem]" />
                  <Skeleton className="h-[2rem] w-[4rem]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[var(--spacing-lg)]">
                <div className="space-y-[var(--spacing-xs)]">
                  <Skeleton className="h-[0.875rem] w-[3rem]" />
                  <Skeleton className="h-[1rem] w-[4rem]" />
                </div>
                <div className="space-y-[var(--spacing-xs)]">
                  <Skeleton className="h-[0.875rem] w-[2rem]" />
                  <Skeleton className="h-[1rem] w-[3rem]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Skeleton */}
      <div className="flex justify-center">
        <div className="flex gap-[var(--spacing-sm)]">
          <Skeleton className="h-[2.5rem] w-[2.5rem]" />
          <Skeleton className="h-[2.5rem] w-[2.5rem]" />
          <Skeleton className="h-[2.5rem] w-[2.5rem]" />
          <Skeleton className="h-[2.5rem] w-[2.5rem]" />
          <Skeleton className="h-[2.5rem] w-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
