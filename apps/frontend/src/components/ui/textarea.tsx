import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-h-[5rem] px-3.5 py-2.5",
        "bg-[hsl(0_0%_97%)] text-foreground text-sm leading-relaxed",
        "border border-[rgba(0,0,0,0.12)] rounded-[6px]",
        "placeholder:text-muted-foreground",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-in-out",
        "outline-none resize-none",
        "hover:border-[rgba(0,0,0,0.22)]",
        "focus:bg-white focus:border-primary focus:shadow-[0_0_0_3px_hsl(243_75%_59%_/_0.12)]",
        "disabled:pointer-events-none disabled:opacity-45",
        "field-sizing-content",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
