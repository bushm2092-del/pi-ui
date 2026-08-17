import NotificationIcon from "../../../../../../assets/svg/notification.svg?react";
import SearchIcon from "../../../../../../assets/svg/search.svg?react";
import { useTranslation } from "react-i18next";

export function SidebarModeLayout({ label }: { label: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div {...({ className: "ms-2 flex items-center pe-1" } as any)}>
      <div className="no-drag -ms-2 flex h-8 min-w-0 select-none items-center px-2 text-sm !text-[17px] !leading-6 font-medium text-token-foreground">
        {label}
      </div>
      <div {...({ className: "ms-auto flex items-center gap-1" } as any)}>
        <span {...({ "data-state": "closed", className: "contents" } as any)}>
          <button
            {...({
              type: "button",
              className:
                "no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 ms-auto translate-x-0.5 sidebar-top-action-button",
              "aria-label": t("sidebar.search"),
            } as any)}
          >
            <SearchIcon className="icon-xs" aria-hidden="true" />
          </button>
        </span>
        <div>
          <span {...({ "data-state": "closed", className: "contents" } as any)}>
            <button
              {...({
                type: "button",
                className:
                  "no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-top-action-button",
                "aria-label": t("sidebar.priority"),
                "aria-pressed": "false",
              } as any)}
            >
              <NotificationIcon className="icon-xs" aria-hidden="true" />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
