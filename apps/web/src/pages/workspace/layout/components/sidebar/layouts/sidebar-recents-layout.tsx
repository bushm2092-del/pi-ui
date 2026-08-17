import MoreHorizontalIcon from "../../../../../../assets/svg/more-horizontal.svg?react";
import NewConversationIcon from "../../../../../../assets/svg/new-conversation.svg?react";
import { useTranslation } from "react-i18next";

interface SidebarRecentsLayoutProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function SidebarRecentsLayout({
  label,
  expanded,
  onToggle,
  children,
}: SidebarRecentsLayoutProps) {
  const { t } = useTranslation();
  return (
    <section
      className="relative px-row-x"
      data-app-action-sidebar-section=""
      data-app-action-sidebar-section-collapsed={String(!expanded)}
      data-app-action-sidebar-section-heading="Recents"
    >
      <div {...({"className":"flex flex-col"} as any)}>
        <div {...({"className":"group/nav-section-title flex items-center justify-between gap-2 pe-0.5 ps-2"} as any)}>
          <div {...({"className":"pi-sidebar-section-heading min-w-0 flex-1 text-base font-medium text-token-input-placeholder-foreground opacity-75"} as any)}>
            <div {...({"className":"flex min-w-0 flex-1"} as any)}>
              <button
                data-app-action-sidebar-section-toggle=""
                type="button"
                className="group/section-toggle flex min-w-0 flex-1 cursor-interaction items-center gap-1 rounded-md py-0.5 pe-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-expanded={expanded}
                aria-controls="sidebar-recents-list"
                onClick={onToggle}
              >
                <span {...({"className":"flex min-w-0 items-center gap-1"} as any)}>
                  <span className="min-w-0 truncate">{label}</span>
                </span>
                <svg {...({"width":"20","height":"21","viewBox":"0 0 20 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","aria-hidden":"true","className":`icon-2xs shrink-0 transition-transform group-hover/section-toggle:opacity-100 group-focus-visible/section-toggle:opacity-100 sidebar-hover-icon-tint ${expanded ? "rotate-0 opacity-0" : "-rotate-90 opacity-100"}`} as any)}>
                  <path {...({"d":"M15.2793 7.71101C15.539 7.45131 15.961 7.45131 16.2207 7.71101C16.4804 7.97071 16.4804 8.39272 16.2207 8.65242L10.4707 14.4024C10.211 14.6621 9.78902 14.6621 9.52932 14.4024L3.77932 8.65242L3.69436 8.54792C3.52385 8.28979 3.55205 7.93828 3.77932 7.71101C4.00659 7.48374 4.3581 7.45554 4.61623 7.62605L4.72073 7.71101L10 12.9903L15.2793 7.71101Z","fill":"currentColor","stroke":"currentColor","strokeWidth":"0.6"} as any)} />
                </svg>
              </button>
            </div>
          </div>
          <div {...({"className":"flex shrink-0 items-center gap-1"} as any)}>
            <div {...({"className":"shrink-0 pointer-events-none opacity-0 group-focus-within/nav-section-title:pointer-events-auto group-focus-within/nav-section-title:opacity-100 group-hover/nav-section-title:pointer-events-auto group-hover/nav-section-title:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100"} as any)}>
              <div {...({"className":"flex items-center gap-1"} as any)}>
                <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 outline-hidden cursor-interaction sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":t("sidebar.actions.conversationOptions"),"id":"radix-_r_h1_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
                  <MoreHorizontalIcon className="icon-xs" aria-hidden="true" />
                </button>
                <div>
                  <span {...({"data-state":"closed","className":"contents"} as any)}>
                    <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":t("sidebar.newConversation")} as any)}>
                      <NewConversationIcon className="icon-xs" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="sidebar-recents-list"
        className="flex flex-col pt-1"
        hidden={!expanded}
      >
        {children}
      </div>
    </section>
  );
}
