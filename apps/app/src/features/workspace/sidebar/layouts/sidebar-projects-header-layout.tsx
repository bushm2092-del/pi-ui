import MoreHorizontalIcon from "../../../../assets/svg/more-horizontal.svg?react";
import PlusIcon from "../../../../assets/svg/plus.svg?react";

export function SidebarProjectsHeaderLayout({ label }: { label: string }) {
  return (
    <div {...({"className":"group/nav-section-title flex items-center justify-between gap-2 pe-0.5 ps-2"} as any)}>
      <div {...({"className":"min-w-0 flex-1 text-base font-medium text-token-input-placeholder-foreground opacity-75"} as any)}>
        <div {...({"className":"flex min-w-0 flex-1"} as any)}>
          <button {...({"data-app-action-sidebar-section-toggle":"","role":"button","tabIndex":"0","aria-disabled":"false","aria-roledescription":"sortable","aria-describedby":"DndDescribedBy-3","type":"button","className":"group/section-toggle flex min-w-0 flex-1 items-center gap-1 rounded-md py-0.5 pe-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-default","aria-expanded":"true"} as any)}>
            <span {...({"className":"flex min-w-0 items-center gap-1"} as any)}>
              <span className="min-w-0 truncate">{label}</span>
            </span>
            <svg {...({"width":"20","height":"21","viewBox":"0 0 20 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","aria-hidden":"true","className":"icon-2xs shrink-0 transition-transform group-hover/section-toggle:opacity-100 group-focus-visible/section-toggle:opacity-100 sidebar-hover-icon-tint opacity-0 rotate-0"} as any)}>
              <path {...({"d":"M15.2793 7.71101C15.539 7.45131 15.961 7.45131 16.2207 7.71101C16.4804 7.97071 16.4804 8.39272 16.2207 8.65242L10.4707 14.4024C10.211 14.6621 9.78902 14.6621 9.52932 14.4024L3.77932 8.65242L3.69436 8.54792C3.52385 8.28979 3.55205 7.93828 3.77932 7.71101C4.00659 7.48374 4.3581 7.45554 4.61623 7.62605L4.72073 7.71101L10 12.9903L15.2793 7.71101Z","fill":"currentColor","stroke":"currentColor","strokeWidth":"0.6"} as any)} />
            </svg>
          </button>
        </div>
      </div>
      <div {...({"className":"flex shrink-0 items-center gap-1"} as any)}>
        <div {...({"className":"shrink-0 pointer-events-none opacity-0 group-focus-within/nav-section-title:pointer-events-auto group-focus-within/nav-section-title:opacity-100 group-hover/nav-section-title:pointer-events-auto group-hover/nav-section-title:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100"} as any)}>
          <div {...({"className":"flex items-center gap-1"} as any)}>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 outline-hidden cursor-interaction sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":"项目侧边栏选项","id":"radix-_r_f3_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
              <MoreHorizontalIcon className="icon-xs" aria-hidden="true" />
            </button>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 relative isolate sidebar-icon-button overflow-visible sidebar-hover-icon-button-tint","aria-label":"添加新项目","data-app-action-sidebar-project-create":""} as any)}>
              <PlusIcon className="icon-xs" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
