import NotificationIcon from "../../../../assets/svg/notification.svg?react";
import SearchIcon from "../../../../assets/svg/search.svg?react";

export function SidebarModeLayout({ label }: { label: React.ReactNode }) {
  return (
    <div {...({"className":"ms-2 flex items-center pe-1"} as any)}>
      <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full text-token-foreground enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent px-2 py-0.5 text-sm leading-[18px] min-w-0 outline-hidden cursor-interaction -ms-2 h-8 min-w-0 rounded-xl px-2 !text-[17px] !leading-6 font-medium","aria-label":"切换模式，当前模式：PI-Codex :UI","id":"radix-_r_eu_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
        {label}
        <svg {...({"width":"20","height":"21","viewBox":"0 0 20 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-2xs shrink-0 text-token-input-placeholder-foreground"} as any)}>
          <path {...({"d":"M15.2793 7.71101C15.539 7.45131 15.961 7.45131 16.2207 7.71101C16.4804 7.97071 16.4804 8.39272 16.2207 8.65242L10.4707 14.4024C10.211 14.6621 9.78902 14.6621 9.52932 14.4024L3.77932 8.65242L3.69436 8.54792C3.52385 8.28979 3.55205 7.93828 3.77932 7.71101C4.00659 7.48374 4.3581 7.45554 4.61623 7.62605L4.72073 7.71101L10 12.9903L15.2793 7.71101Z","fill":"currentColor","stroke":"currentColor","strokeWidth":"0.6"} as any)} />
        </svg>
      </button>
      <div {...({"className":"ms-auto flex items-center gap-1"} as any)}>
        <span {...({"data-state":"closed","className":"contents"} as any)}>
          <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 ms-auto translate-x-0.5 sidebar-top-action-button","aria-label":"搜索"} as any)}>
            <SearchIcon className="icon-xs" aria-hidden="true" />
          </button>
        </span>
        <div>
          <span {...({"data-state":"closed","className":"contents"} as any)}>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-top-action-button","aria-label":"优先级，需要关注","aria-pressed":"false"} as any)}>
              <NotificationIcon className="icon-xs" aria-hidden="true" />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
