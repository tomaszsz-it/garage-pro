import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--spacing-sm)] whitespace-nowrap text-[var(--font-size-body)] font-[var(--font-weight-medium)] transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-[var(--state-disabled-opacity)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-[var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-[var(--radius-md)] shadow-[var(--elevation-2)] hover:bg-primary/90 hover:shadow-[var(--elevation-4)] active:shadow-[var(--elevation-2)] hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground rounded-[var(--radius-md)] shadow-[var(--elevation-2)] hover:shadow-[var(--elevation-4)] active:shadow-[var(--elevation-2)] hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-[var(--neutral-30)] bg-background text-foreground rounded-[var(--radius-md)] shadow-[var(--elevation-2)] hover:bg-[var(--neutral-20)] hover:shadow-[var(--elevation-4)] active:bg-[var(--neutral-30)] active:shadow-[var(--elevation-2)] hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground rounded-[var(--radius-md)] shadow-[var(--elevation-2)] hover:bg-[var(--neutral-30)] hover:shadow-[var(--elevation-4)] active:shadow-[var(--elevation-2)] hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "rounded-[var(--radius-md)] hover:bg-[var(--neutral-20)] active:bg-[var(--neutral-30)] text-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-[var(--radius-sm)] focus-visible:bg-[var(--neutral-20)]",
      },
      size: {
        default: "h-[2.5rem] px-[var(--spacing-xl)] py-[var(--spacing-sm)] has-[>svg]:px-[var(--spacing-lg)]",
        sm: "h-[2rem] px-[var(--spacing-lg)] py-[var(--spacing-xs)] gap-[var(--spacing-xs)] text-[var(--font-size-body)] has-[>svg]:px-[var(--spacing-md)]",
        lg: "h-[3rem] px-[var(--spacing-2xl)] py-[var(--spacing-md)] text-[var(--font-size-body-large)] has-[>svg]:px-[var(--spacing-xl)]",
        icon: "size-[2.5rem] p-0",
        "icon-sm": "size-[2rem] p-0",
        "icon-lg": "size-[3rem] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
