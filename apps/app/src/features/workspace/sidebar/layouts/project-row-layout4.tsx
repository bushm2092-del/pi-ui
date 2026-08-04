import { LayoutSlot, type LayoutProps } from "../../layout";

export function ProjectRowLayout4({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"data-app-action-sidebar-project-collapsed":"true","data-app-action-sidebar-project-id":"a0bd3b14-ae64-4c18-828f-9fdfa2339bd2","data-app-action-sidebar-project-label":"casdoor","data-app-action-sidebar-project-row":"","className":"sidebar-item group/folder-row group relative flex h-[var(--height-token-row)] cursor-interaction items-center justify-between overflow-x-hidden text-sm text-token-foreground hover:bg-token-list-hover-background focus-visible:outline focus-visible:outline-offset-2","role":"button","tabIndex":"0","aria-label":"casdoor","aria-expanded":"false"} as any)} {...rootProps}>
      <div {...({"className":"flex min-w-0 flex-1 items-center gap-1 ps-1"} as any)}>
        <span {...({"data-sidebar-project-drop-zone":"project-icon","data-sidebar-project-kind":"local","className":"-mx-[3px] flex size-[var(--height-token-row)] shrink-0 items-center justify-center"} as any)}>
          <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs shrink-0"} as any)}>
            <path {...({"d":"M5.36914 2.1416C5.92368 2.14164 6.3602 2.23705 6.73242 2.38965C7.09745 2.53934 7.38155 2.73818 7.61816 2.9043C8.07599 3.22573 8.42077 3.47464 9.16602 3.47461H11.9473C13.3336 3.47484 14.4453 4.61217 14.4453 6V7.06543C14.4453 7.07196 14.4435 7.07845 14.4434 7.08496V11.3311C14.4432 12.7187 13.3316 13.8562 11.9453 13.8564H4.05371C2.66747 13.8562 1.55583 12.7187 1.55566 11.3311V7.35059C1.55545 7.34451 1.55377 7.33815 1.55371 7.33203C1.55371 7.32563 1.55539 7.31884 1.55566 7.3125V4.66699C1.55566 3.27918 2.66737 2.14185 4.05371 2.1416H5.36914ZM2.60547 7.85645V11.3311C2.60563 12.1519 3.26037 12.8054 4.05371 12.8057H11.9453C12.7387 12.8054 13.3934 12.1519 13.3936 11.3311V7.85645H2.60547ZM4.05371 3.19238C3.26027 3.19264 2.60547 3.84598 2.60547 4.66699V6.80664H13.3955V6C13.3955 5.17898 12.7407 4.52562 11.9473 4.52539H9.16699C8.07975 4.52558 7.50694 4.10863 7.01562 3.76367C6.77766 3.5966 6.57849 3.46159 6.33398 3.36133C6.09656 3.264 5.79646 3.19242 5.36914 3.19238H4.05371Z","fill":"currentColor"} as any)} />
          </svg>
        </span>
        <div {...({"className":"flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap rounded-md py-1 pe-0 text-left text-base text-token-foreground"} as any)}>
          <span {...({"className":"flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap"} as any)}>
            <span {...({"className":"flex min-w-0 flex-1 items-center gap-0.5"} as any)}>
              <LayoutSlot name="sidebar-project-label" slots={slots} />
            </span>
          </span>
        </div>
      </div>
      <div {...({"className":"flex max-w-[50%] min-w-0 gap-1"} as any)}>
        <div {...({"className":"w-0 overflow-hidden opacity-0 group-hover/folder-row:w-auto group-hover/folder-row:overflow-visible group-hover/folder-row:opacity-100 focus-within:w-auto focus-within:overflow-visible focus-within:opacity-100"} as any)}>
          <div {...({"className":"outline-hidden cursor-interaction pe-0.5","type":"button","id":"radix-_r_gu_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":"casdoor 的项目操作","aria-haspopup":"menu","aria-expanded":"false"} as any)}>
              <svg {...({"width":"21","height":"21","viewBox":"0 0 21 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                <path {...({"d":"M15.6981 9.04712C16.5255 9.04712 17.1959 9.71781 17.1961 10.5452C17.1961 11.3727 16.5256 12.0442 15.6981 12.0442C14.8706 12.0442 14.2 11.3727 14.2 10.5452C14.2002 9.71781 14.8707 9.04712 15.6981 9.04712Z","fill":"currentColor"} as any)} />
                <path {...({"d":"M4.69806 9.04712C5.52546 9.04712 6.19691 9.71781 6.19708 10.5452C6.19708 11.3727 5.52557 12.0442 4.69806 12.0442C3.8707 12.044 3.20001 11.3726 3.20001 10.5452C3.20019 9.71792 3.87081 9.04729 4.69806 9.04712Z","fill":"currentColor"} as any)} />
                <path {...({"d":"M10.2003 9.04712C11.0276 9.0473 11.6982 9.71792 11.6984 10.5452C11.6984 11.3726 11.0277 12.044 10.2003 12.0442C9.37284 12.0442 8.70132 11.3727 8.70132 10.5452C8.7015 9.71781 9.37295 9.04712 10.2003 9.04712Z","fill":"currentColor"} as any)} />
              </svg>
            </button>
          </div>
        </div>
        <div {...({"className":"me-0.5 grid h-6 max-w-48 min-w-6 shrink grid-cols-1 items-center group-hover/folder-row:w-6"} as any)}>
          <span {...({"className":"col-start-1 row-start-1 inline-flex justify-self-end opacity-0 group-hover/folder-row:opacity-100"} as any)}>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-icon-button sidebar-hover-icon-button-tint","aria-label":"在 casdoor 中开始新聊天"} as any)}>
              <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                <path {...({"d":"M6.33325 1.88379C6.58178 1.88379 6.78345 2.08546 6.78345 2.33398C6.78328 2.58237 6.58168 2.78418 6.33325 2.78418H4.66626C3.62638 2.78435 2.78362 3.62711 2.78345 4.66699V11.334C2.78361 12.3739 3.62637 13.2176 4.66626 13.2178H11.3333C12.3733 13.2178 13.2169 12.374 13.217 11.334V9.66699C13.2172 9.41872 13.418 9.21795 13.6663 9.21777C13.9147 9.21777 14.1163 9.41861 14.1165 9.66699V11.334C14.1163 12.871 12.8703 14.1172 11.3333 14.1172H4.66626C3.12932 14.117 1.88322 12.8709 1.88306 11.334V4.66699C1.88323 3.13006 3.12933 1.88396 4.66626 1.88379H6.33325Z","fill":"currentColor"} as any)} />
                <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M10.8948 2.375C11.6494 1.63227 12.8628 1.63698 13.6116 2.38574C14.362 3.13643 14.3637 4.35266 13.6165 5.10644L9.36353 9.39355C9.01402 9.74579 8.56977 9.98985 8.08521 10.0967L6.17603 10.5166C5.74813 10.6107 5.36686 10.2296 5.46118 9.80176L5.88208 7.89746C5.98978 7.4105 6.23578 6.96428 6.59106 6.61426L10.8948 2.375ZM12.9749 3.02148C12.5756 2.62258 11.9289 2.62086 11.5266 3.0166L7.2229 7.25586C6.99148 7.4839 6.83116 7.77457 6.76099 8.0918L6.44165 9.53711L7.89185 9.21777C8.20744 9.14811 8.49721 8.98919 8.72485 8.75976L12.9778 4.47266C13.3759 4.07066 13.375 3.42164 12.9749 3.02148Z","fill":"currentColor"} as any)} />
              </svg>
            </button>
          </span>
        </div>
      </div>
      <button {...({"type":"button","aria-hidden":"true","tabIndex":"-1","className":"sr-only","data-app-action-sidebar-select-project":""} as any)} />
    </div>
  );
}
