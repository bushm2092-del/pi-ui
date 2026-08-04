export function MainHeaderContextLayout({
  title,
  summaryToggle,
}: {
  title: string;
  summaryToggle: React.ReactNode;
}) {
  return (
    <div {...({"aria-hidden":"false","data-testid":"app-shell-header-context-menu-surface","className":"pointer-events-none relative ms-2 flex h-full min-w-0 flex-1 isolate items-center gap-1.5 overflow-hidden [contain:layout_paint] pe-1.5"} as any)}>
      <div {...({"className":"pointer-events-none w-full min-w-0 flex-1 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_textarea]:pointer-events-auto"} as any)}>
        <div {...({"className":"grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 draggable electron:h-toolbar extension:py-row-y"} as any)}>
          <div {...({"className":"text-md flex min-w-0 items-center gap-0 truncate text-base focus-within:overflow-visible electron:font-medium"} as any)}>
            <div {...({"className":"flex min-w-0 items-center gap-0.5"} as any)}>
              <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-lg text-token-foreground enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent h-token-button-composer px-2 py-0 text-base leading-[18px] aspect-square shrink-0 items-center justify-center !px-0 shrink-0","aria-label":"项目：pi-ui","aria-haspopup":"dialog","aria-expanded":"false","aria-controls":"radix-_r_ks_","data-state":"closed","data-slot":"popover-trigger"} as any)}>
                <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                  <path {...({"d":"M5.36914 2.1416C5.92368 2.14164 6.3602 2.23705 6.73242 2.38965C7.09745 2.53934 7.38155 2.73818 7.61816 2.9043C8.07599 3.22573 8.42077 3.47464 9.16602 3.47461H11.9473C13.3336 3.47484 14.4453 4.61217 14.4453 6V7.06543C14.4453 7.07196 14.4435 7.07845 14.4434 7.08496V11.3311C14.4432 12.7187 13.3316 13.8562 11.9453 13.8564H4.05371C2.66747 13.8562 1.55583 12.7187 1.55566 11.3311V7.35059C1.55545 7.34451 1.55377 7.33815 1.55371 7.33203C1.55371 7.32563 1.55539 7.31884 1.55566 7.3125V4.66699C1.55566 3.27918 2.66737 2.14185 4.05371 2.1416H5.36914ZM2.60547 7.85645V11.3311C2.60563 12.1519 3.26037 12.8054 4.05371 12.8057H11.9453C12.7387 12.8054 13.3934 12.1519 13.3936 11.3311V7.85645H2.60547ZM4.05371 3.19238C3.26027 3.19264 2.60547 3.84598 2.60547 4.66699V6.80664H13.3955V6C13.3955 5.17898 12.7407 4.52562 11.9473 4.52539H9.16699C8.07975 4.52558 7.50694 4.10863 7.01562 3.76367C6.77766 3.5966 6.57849 3.46159 6.33398 3.36133C6.09656 3.264 5.79646 3.19242 5.36914 3.19238H4.05371Z","fill":"currentColor"} as any)} />
                </svg>
              </button>
              <div {...({"className":"max-w-[320px] min-w-0 truncate focus-within:overflow-visible"} as any)}>
                <span {...({"className":"inline-flex max-w-[320px] min-w-[2ch] items-center overflow-hidden text-token-foreground focus-within:overflow-visible"} as any)}>
                  <button
                    type="button"
                    className="no-drag -ms-0.5 min-w-0 cursor-interaction truncate rounded-md px-1.5 text-left text-base leading-6 font-medium text-token-foreground hover:bg-token-list-hover-background focus-visible:bg-token-list-hover-background focus-visible:outline-none max-w-[320px]"
                  >
                    {title}
                  </button>
                </span>
              </div>
            </div>
            <div {...({"className":"flex min-w-0 items-center gap-1"} as any)}>
              <div {...({"className":"flex items-center gap-2 no-drag"} as any)}>
                <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 outline-hidden cursor-interaction no-drag","aria-label":"聊天操作","id":"radix-_r_kt_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
                  <svg {...({"width":"21","height":"21","viewBox":"0 0 21 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-sm"} as any)}>
                    <path {...({"d":"M15.6981 9.04712C16.5255 9.04712 17.1959 9.71781 17.1961 10.5452C17.1961 11.3727 16.5256 12.0442 15.6981 12.0442C14.8706 12.0442 14.2 11.3727 14.2 10.5452C14.2002 9.71781 14.8707 9.04712 15.6981 9.04712Z","fill":"currentColor"} as any)} />
                    <path {...({"d":"M4.69806 9.04712C5.52546 9.04712 6.19691 9.71781 6.19708 10.5452C6.19708 11.3727 5.52557 12.0442 4.69806 12.0442C3.8707 12.044 3.20001 11.3726 3.20001 10.5452C3.20019 9.71792 3.87081 9.04729 4.69806 9.04712Z","fill":"currentColor"} as any)} />
                    <path {...({"d":"M10.2003 9.04712C11.0276 9.0473 11.6982 9.71792 11.6984 10.5452C11.6984 11.3726 11.0277 12.044 10.2003 12.0442C9.37284 12.0442 8.70132 11.3727 8.70132 10.5452C8.7015 9.71781 9.37295 9.04712 10.2003 9.04712Z","fill":"currentColor"} as any)} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div {...({"className":"flex items-center justify-end gap-1.5"} as any)} />
        </div>
      </div>
      <div {...({"className":"ms-auto flex shrink-0 items-center gap-1.5"} as any)}>
        <div {...({"className":"pointer-events-auto flex shrink-0 items-center no-drag"} as any)}>
          <span {...({"data-state":"closed","className":"contents"} as any)}>
            {summaryToggle}
          </span>
        </div>
      </div>
    </div>
  );
}
