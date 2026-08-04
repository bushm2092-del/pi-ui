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
              <svg {...({"width":"21","height":"21","viewBox":"0 0 21 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                <path {...({"d":"M15.6981 9.04712C16.5255 9.04712 17.1959 9.71781 17.1961 10.5452C17.1961 11.3727 16.5256 12.0442 15.6981 12.0442C14.8706 12.0442 14.2 11.3727 14.2 10.5452C14.2002 9.71781 14.8707 9.04712 15.6981 9.04712Z","fill":"currentColor"} as any)} />
                <path {...({"d":"M4.69806 9.04712C5.52546 9.04712 6.19691 9.71781 6.19708 10.5452C6.19708 11.3727 5.52557 12.0442 4.69806 12.0442C3.8707 12.044 3.20001 11.3726 3.20001 10.5452C3.20019 9.71792 3.87081 9.04729 4.69806 9.04712Z","fill":"currentColor"} as any)} />
                <path {...({"d":"M10.2003 9.04712C11.0276 9.0473 11.6982 9.71792 11.6984 10.5452C11.6984 11.3726 11.0277 12.044 10.2003 12.0442C9.37284 12.0442 8.70132 11.3727 8.70132 10.5452C8.7015 9.71781 9.37295 9.04712 10.2003 9.04712Z","fill":"currentColor"} as any)} />
              </svg>
            </button>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 relative isolate sidebar-icon-button overflow-visible sidebar-hover-icon-button-tint","aria-label":"添加新项目","data-app-action-sidebar-project-create":""} as any)}>
              <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                <path {...({"d":"M9.33496 16.5V10.665H3.5C3.13273 10.665 2.83496 10.3673 2.83496 10C2.83496 9.63273 3.13273 9.33496 3.5 9.33496H9.33496V3.5C9.33496 3.13273 9.63273 2.83496 10 2.83496C10.3673 2.83496 10.665 3.13273 10.665 3.5V9.33496H16.5L16.6338 9.34863C16.9369 9.41057 17.165 9.67857 17.165 10C17.165 10.3214 16.9369 10.5894 16.6338 10.6514L16.5 10.665H10.665V16.5C10.665 16.8673 10.3673 17.165 10 17.165C9.63273 17.165 9.33496 16.8673 9.33496 16.5Z","fill":"currentColor"} as any)} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
