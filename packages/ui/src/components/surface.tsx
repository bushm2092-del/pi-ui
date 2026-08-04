import * as React from "react";
import { cn } from "../lib";

const variants = {
  main: "bg-surface-main",
  sidebar: "bg-surface-sidebar",
  elevated: "bg-surface-elevated",
  input: "bg-surface-input",
  overlay: "bg-surface-overlay"
} as const;

export function Surface({
  className,
  variant = "main",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return <div className={cn(variants[variant], className)} {...props} />;
}
