import * as React from "react";
import { cn } from "../lib";

export interface NavigationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ active, icon, trailing, children, className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-active={active || undefined}
      className={cn(
        "group/nav-item relative flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-sm",
        "text-foreground-secondary transition-colors duration-150 hover:bg-interaction-hover hover:text-foreground-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        "data-[active=true]:bg-interaction-selected data-[active=true]:font-medium data-[active=true]:text-foreground-primary",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">{icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing ? (
        <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/nav-item:opacity-100 group-focus-within/nav-item:opacity-100">
          {trailing}
        </span>
      ) : null}
    </button>
  )
);

NavigationItem.displayName = "NavigationItem";
