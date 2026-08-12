export function SidebarRecentsLayout({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <section {...({"className":"relative px-row-x","data-app-action-sidebar-section":"","data-app-action-sidebar-section-collapsed":"true","data-app-action-sidebar-section-heading":"Recents"} as any)}>
      <div {...({"className":"flex flex-col"} as any)}>
        <div {...({"className":"group/nav-section-title flex items-center justify-between gap-2 pe-0.5 ps-2"} as any)}>
          <div {...({"className":"min-w-0 flex-1 text-base font-medium text-token-input-placeholder-foreground opacity-75"} as any)}>
            <div {...({"className":"flex min-w-0 flex-1"} as any)}>
              <button {...({"data-app-action-sidebar-section-toggle":"","role":"button","tabIndex":"0","aria-disabled":"false","aria-roledescription":"sortable","aria-describedby":"DndDescribedBy-3","type":"button","className":"group/section-toggle flex min-w-0 flex-1 items-center gap-1 rounded-md py-0.5 pe-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-default","aria-expanded":"false"} as any)}>
                <span {...({"className":"flex min-w-0 items-center gap-1"} as any)}>
                  <span className="min-w-0 truncate">{label}</span>
                </span>
                <svg {...({"width":"20","height":"21","viewBox":"0 0 20 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","aria-hidden":"true","className":"icon-2xs shrink-0 transition-transform group-hover/section-toggle:opacity-100 group-focus-visible/section-toggle:opacity-100 sidebar-hover-icon-tint opacity-100 -rotate-90"} as any)}>
                  <path {...({"d":"M15.2793 7.71101C15.539 7.45131 15.961 7.45131 16.2207 7.71101C16.4804 7.97071 16.4804 8.39272 16.2207 8.65242L10.4707 14.4024C10.211 14.6621 9.78902 14.6621 9.52932 14.4024L3.77932 8.65242L3.69436 8.54792C3.52385 8.28979 3.55205 7.93828 3.77932 7.71101C4.00659 7.48374 4.3581 7.45554 4.61623 7.62605L4.72073 7.71101L10 12.9903L15.2793 7.71101Z","fill":"currentColor","stroke":"currentColor","strokeWidth":"0.6"} as any)} />
                </svg>
              </button>
            </div>
          </div>
          <div {...({"className":"flex shrink-0 items-center gap-1"} as any)}>
            <div {...({"className":"shrink-0 pointer-events-none opacity-0 group-focus-within/nav-section-title:pointer-events-auto group-focus-within/nav-section-title:opacity-100 group-hover/nav-section-title:pointer-events-auto group-hover/nav-section-title:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100"} as any)}>
              <div {...({"className":"flex items-center gap-1"} as any)}>
                <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 outline-hidden cursor-interaction sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":"聊天侧边栏选项","id":"radix-_r_h1_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
                  <svg {...({"width":"21","height":"21","viewBox":"0 0 21 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                    <path {...({"d":"M15.6981 9.04712C16.5255 9.04712 17.1959 9.71781 17.1961 10.5452C17.1961 11.3727 16.5256 12.0442 15.6981 12.0442C14.8706 12.0442 14.2 11.3727 14.2 10.5452C14.2002 9.71781 14.8707 9.04712 15.6981 9.04712Z","fill":"currentColor"} as any)} />
                    <path {...({"d":"M4.69806 9.04712C5.52546 9.04712 6.19691 9.71781 6.19708 10.5452C6.19708 11.3727 5.52557 12.0442 4.69806 12.0442C3.8707 12.044 3.20001 11.3726 3.20001 10.5452C3.20019 9.71792 3.87081 9.04729 4.69806 9.04712Z","fill":"currentColor"} as any)} />
                    <path {...({"d":"M10.2003 9.04712C11.0276 9.0473 11.6982 9.71792 11.6984 10.5452C11.6984 11.3726 11.0277 12.044 10.2003 12.0442C9.37284 12.0442 8.70132 11.3727 8.70132 10.5452C8.7015 9.71781 9.37295 9.04712 10.2003 9.04712Z","fill":"currentColor"} as any)} />
                  </svg>
                </button>
                <div>
                  <span {...({"data-state":"closed","className":"contents"} as any)}>
                    <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":"新对话"} as any)}>
                      <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                        <path {...({"d":"M6.33325 1.88379C6.58178 1.88379 6.78345 2.08546 6.78345 2.33398C6.78328 2.58237 6.58168 2.78418 6.33325 2.78418H4.66626C3.62638 2.78435 2.78362 3.62711 2.78345 4.66699V11.334C2.78361 12.3739 3.62637 13.2176 4.66626 13.2178H11.3333C12.3733 13.2178 13.2169 12.374 13.217 11.334V9.66699C13.2172 9.41872 13.418 9.21795 13.6663 9.21777C13.9147 9.21777 14.1163 9.41861 14.1165 9.66699V11.334C14.1163 12.871 12.8703 14.1172 11.3333 14.1172H4.66626C3.12932 14.117 1.88322 12.8709 1.88306 11.334V4.66699C1.88323 3.13006 3.12933 1.88396 4.66626 1.88379H6.33325Z","fill":"currentColor"} as any)} />
                        <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M10.8948 2.375C11.6494 1.63227 12.8628 1.63698 13.6116 2.38574C14.362 3.13643 14.3637 4.35266 13.6165 5.10644L9.36353 9.39355C9.01402 9.74579 8.56977 9.98985 8.08521 10.0967L6.17603 10.5166C5.74813 10.6107 5.36686 10.2296 5.46118 9.80176L5.88208 7.89746C5.98978 7.4105 6.23578 6.96428 6.59106 6.61426L10.8948 2.375ZM12.9749 3.02148C12.5756 2.62258 11.9289 2.62086 11.5266 3.0166L7.2229 7.25586C6.99148 7.4839 6.83116 7.77457 6.76099 8.0918L6.44165 9.53711L7.89185 9.21777C8.20744 9.14811 8.49721 8.98919 8.72485 8.75976L12.9778 4.47266C13.3759 4.07066 13.375 3.42164 12.9749 3.02148Z","fill":"currentColor"} as any)} />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {children ? <div className="flex flex-col pt-1">{children}</div> : null}
    </section>
  );
}
