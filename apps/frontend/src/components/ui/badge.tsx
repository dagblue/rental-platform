import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Sharp corners (4px), no pill, tight uppercase tracking
  "inline-flex items-center border px-[7px] py-[3px] text-[11px] font-700 leading-none tracking-[0.03em] uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground rounded-[4px]",
        secondary:
          "border-[rgba(0,0,0,0.1)] bg-secondary text-secondary-foreground rounded-[4px]",
        destructive:
          "border-transparent bg-destructive text-white rounded-[4px]",
        outline:
          "border-[rgba(0,0,0,0.15)] text-foreground bg-transparent rounded-[4px]",
        success:
          "border-transparent bg-emerald-500 text-white rounded-[4px]",
        warning:
          "border-transparent bg-amber-500 text-white rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
