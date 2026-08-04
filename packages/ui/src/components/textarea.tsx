import * as React from "react";
import { cn } from "../lib";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-20 w-full resize-y rounded-lg border border-border-default bg-surface-input px-3 py-2 text-base",
        "placeholder:text-foreground-tertiary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
