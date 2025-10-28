import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-caption)] font-[var(--font-weight-medium)] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-[var(--spacing-xs)] [&>svg]:pointer-events-none focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-[var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] transition-all duration-150 ease-out overflow-hidden select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-[var(--radius-sm)] border-none shadow-[var(--elevation-2)] [a&]:hover:shadow-[var(--elevation-4)] [a&]:hover:scale-105 [a&]:active:scale-95",
        secondary:
          "bg-[var(--neutral-20)] text-[var(--neutral-100)] rounded-[var(--radius-sm)] border border-[var(--neutral-30)] [a&]:hover:bg-[var(--neutral-30)] [a&]:hover:shadow-[var(--elevation-2)] [a&]:hover:scale-105 [a&]:active:scale-95",
        success:
          "bg-success text-success-foreground rounded-[var(--radius-sm)] border-none shadow-[var(--elevation-2)] [a&]:hover:shadow-[var(--elevation-4)] [a&]:hover:scale-105 [a&]:active:scale-95",
        warning:
          "bg-warning text-warning-foreground rounded-[var(--radius-sm)] border-none shadow-[var(--elevation-2)] [a&]:hover:shadow-[var(--elevation-4)] [a&]:hover:scale-105 [a&]:active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground rounded-[var(--radius-sm)] border-none shadow-[var(--elevation-2)] [a&]:hover:shadow-[var(--elevation-4)] [a&]:hover:scale-105 [a&]:active:scale-95",
        info: "bg-info text-info-foreground rounded-[var(--radius-sm)] border-none shadow-[var(--elevation-2)] [a&]:hover:shadow-[var(--elevation-4)] [a&]:hover:scale-105 [a&]:active:scale-95",
        outline:
          "text-foreground border border-[var(--neutral-30)] bg-transparent rounded-[var(--radius-sm)] [a&]:hover:bg-[var(--neutral-20)] [a&]:hover:shadow-[var(--elevation-2)] [a&]:hover:scale-105 [a&]:active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
