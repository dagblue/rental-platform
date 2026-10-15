import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        "w-full min-w-0 h-10 px-3.5 py-2",
        "bg-[hsl(0_0%_97%)] text-foreground text-sm",
        "border border-[rgba(0,0,0,0.12)] rounded-[6px]",
        "placeholder:text-muted-foreground",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-in-out",
        "outline-none",
        // Hover
        "hover:border-[rgba(0,0,0,0.22)]",
        // Focus
        "focus:bg-white focus:border-primary focus:shadow-[0_0_0_3px_hsl(243_75%_59%_/_0.12)]",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-45 disabled:bg-muted",
        // Invalid
        "aria-invalid:border-destructive aria-invalid:focus:shadow-[0_0_0_3px_hsl(0_72%_51%_/_0.12)]",
        // File input reset
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
