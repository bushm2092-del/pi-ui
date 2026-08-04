import * as React from "react";
import { cn } from "../lib";

const variants = {
  neutral: "bg-interaction-muted text-foreground-secondary",
  success: "bg-status-success/10 text-status-success",
  warning: "bg-status-warning/10 text-status-warning",
  danger: "bg-status-danger/10 text-status-danger",
  info: "bg-status-info/10 text-status-info"
} as const;

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn("inline-flex h-5 items-center rounded px-1.5 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}
