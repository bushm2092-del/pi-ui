import * as React from "react";
import { cn } from "../lib";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "no-drag inline-flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary transition-colors duration-150",
        "hover:bg-interaction-hover hover:text-foreground-primary active:bg-interaction-active",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "size-7 [&_svg]:size-3.5" : "size-8 [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
);

IconButton.displayName = "IconButton";
