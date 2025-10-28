import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-[var(--neutral-20)] animate-pulse rounded-[var(--radius-md)] relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        "dark:bg-[var(--neutral-90)] dark:before:via-white/10",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
