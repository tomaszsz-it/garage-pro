import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMemo } from "react";

export function LoadingIndicator() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // Memoize skeleton content to prevent unnecessary re-renders
  const skeletonContent = useMemo(() => {
    return (
      <>
        {/* Filter Panel Skeleton */}
        <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)] space-y-[var(--spacing-2xl)]">
          <div className="flex flex-col md:flex-row gap-[var(--spacing-lg)]">
            <Skeleton className="h-[2.5rem] flex-1" />
            <Skeleton className="h-[2.5rem] flex-1" />
            <Skeleton className="h-[2.5rem] flex-1" />
            <Skeleton className="h-[2.5rem] w-[7.5rem] flex-shrink-0" />
          </div>
        </div>

        {isDesktop ? (
          // Table Skeleton
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--neutral-30)] bg-card shadow-[var(--elevation-2)]">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[var(--neutral-30)] bg-[var(--neutral-10)]">
                  <th className="p-[var(--spacing-lg)] text-left w-32">
                    <Skeleton className="h-[1rem] w-[5rem]" />
                  </th>
                  <th className="p-[var(--spacing-lg)] text-left w-24">
                    <Skeleton className="h-[1rem] w-[5rem]" />
                  </th>
                  <th className="p-[var(--spacing-lg)] text-left w-40">
                    <Skeleton className="h-[1rem] w-[8rem]" />
                  </th>
                  <th className="p-[var(--spacing-lg)] text-left w-32">
                    <Skeleton className="h-[1rem] w-[6rem]" />
                  </th>
                  <th className="p-[var(--spacing-lg)] text-left w-24">
                    <Skeleton className="h-[1rem] w-[5rem]" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--neutral-30)]"
                  >
                    <td className="p-[var(--spacing-lg)]">
                      <Skeleton className="h-[1rem] w-[5rem]" />
                    </td>
                    <td className="p-[var(--spacing-lg)]">
                      <Skeleton className="h-[1rem] w-[4rem]" />
                    </td>
                    <td className="p-[var(--spacing-lg)]">
                      <Skeleton className="h-[1rem] w-[8rem]" />
                    </td>
                    <td className="p-[var(--spacing-lg)]">
                      <Skeleton className="h-[1rem] w-[6rem]" />
                    </td>
                    <td className="p-[var(--spacing-lg)]">
                      <Skeleton className="h-[1.5rem] w-[5rem] rounded-[var(--radius-sm)]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Cards Skeleton
          <div className="space-y-[var(--spacing-lg)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-card p-[var(--spacing-xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]"
              >
                <div className="flex justify-between items-start mb-[var(--spacing-lg)]">
                  <div className="space-y-[var(--spacing-sm)]">
                    <Skeleton className="h-[1.25rem] w-[8rem]" />
                    <Skeleton className="h-[1rem] w-[6rem]" />
                  </div>
                  <Skeleton className="h-[1.5rem] w-[5rem] rounded-[var(--radius-sm)]" />
                </div>
                <div className="space-y-[var(--spacing-xs)]">
                  <Skeleton className="h-[1rem] w-[6rem]" />
                  <Skeleton className="h-[1rem] w-[4rem]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Skeleton */}
        <div className="flex justify-center gap-[var(--spacing-xs)] p-[var(--spacing-lg)] bg-background rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)]">
          <Skeleton className="h-[2rem] w-[2rem] rounded-[var(--radius-md)]" />
          <Skeleton className="h-[2rem] w-[2rem] rounded-[var(--radius-md)]" />
          <Skeleton className="h-[2rem] w-[2rem] rounded-[var(--radius-md)]" />
        </div>
      </>
    );
  }, [isDesktop]);

  return (
    <div
      role="status"
      aria-label="Ładowanie zawartości"
      className="space-y-[var(--spacing-2xl)]"
    >
      {skeletonContent}
    </div>
  );
}
