import { LayoutSlot, type LayoutProps } from "../../layout";

export function SummarySectionLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <section {...({"className":"relative z-0 flex flex-col pb-3 after:absolute after:inset-x-3.5 after:bottom-0 after:h-[0.5px] after:bg-token-border-default after:content-[''] last:after:hidden last:pb-0"} as any)} {...rootProps}>
      <header {...({"className":"sticky top-0 z-10 flex h-7 w-full min-w-0 items-center justify-start gap-2 pe-2.5 pb-0.5 text-base text-token-text-tertiary bg-token-dropdown-background ps-3.5"} as any)}>
        <button {...({"aria-expanded":"true","className":"group/section-toggle inline-flex min-w-0 shrink-0 cursor-interaction items-center gap-1.5 rounded-md py-0.5 pe-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-token-focus-border","type":"button"} as any)}>
          <LayoutSlot name="summary-section-label" slots={slots} />
          <svg {...({"width":"20","height":"21","viewBox":"0 0 20 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","aria-hidden":"true","className":"icon-2xs shrink-0 group-hover/section-toggle:opacity-100 group-focus-visible/section-toggle:opacity-100 transition-transform opacity-0 rotate-0"} as any)}>
            <path {...({"d":"M15.2793 7.71101C15.539 7.45131 15.961 7.45131 16.2207 7.71101C16.4804 7.97071 16.4804 8.39272 16.2207 8.65242L10.4707 14.4024C10.211 14.6621 9.78902 14.6621 9.52932 14.4024L3.77932 8.65242L3.69436 8.54792C3.52385 8.28979 3.55205 7.93828 3.77932 7.71101C4.00659 7.48374 4.3581 7.45554 4.61623 7.62605L4.72073 7.71101L10 12.9903L15.2793 7.71101Z","fill":"currentColor","stroke":"currentColor","strokeWidth":"0.6"} as any)} />
          </svg>
        </button>
        <div {...({"className":"flex min-w-0 flex-1"} as any)}>
          <span {...({"className":"ms-auto flex items-center gap-0.5","data-slot":"thread-summary-panel-section-actions"} as any)}>
            <span {...({"data-state":"closed","className":"contents"} as any)}>
              <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 aspect-square shrink-0 items-center justify-center !px-0 size-token-button-composer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-token-focus-border outline-hidden cursor-interaction","id":"radix-_r_kh_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed","aria-label":"创建文件或站点","data-slot":"thread-summary-panel-icon-button"} as any)}>
                <span {...({"className":"icon-sm flex items-center justify-center [&_svg]:size-full"} as any)}>
                  <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"text-token-conversation-summary-trailing"} as any)}>
                    <path {...({"d":"M9.33496 16.5V10.665H3.5C3.13273 10.665 2.83496 10.3673 2.83496 10C2.83496 9.63273 3.13273 9.33496 3.5 9.33496H9.33496V3.5C9.33496 3.13273 9.63273 2.83496 10 2.83496C10.3673 2.83496 10.665 3.13273 10.665 3.5V9.33496H16.5L16.6338 9.34863C16.9369 9.41057 17.165 9.67857 17.165 10C17.165 10.3214 16.9369 10.5894 16.6338 10.6514L16.5 10.665H10.665V16.5C10.665 16.8673 10.3673 17.165 10 17.165C9.63273 17.165 9.33496 16.8673 9.33496 16.5Z","fill":"currentColor"} as any)} />
                  </svg>
                </span>
              </button>
            </span>
          </span>
        </div>
      </header>
      <div {...({"className":"relative z-0 overflow-hidden","style":{"height":"auto","opacity":"1","marginTop":"2px"}} as any)}>
        <div {...({"className":"flex flex-col gap-0.5 px-3.5"} as any)}>
          <button {...({"aria-expanded":"false","aria-haspopup":"menu","className":"group/summary-panel-item relative isolate flex min-h-token-button-composer w-full min-w-0 items-center gap-token-button-composer-gap rounded-sm border-0 bg-transparent px-0 py-1 text-left cursor-interaction hover:text-token-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-token-focus-border disabled:cursor-not-allowed disabled:text-token-text-tertiary text-token-conversation-summary-trailing","data-slot":"thread-summary-panel-item-button","type":"button"} as any)}>
            <LayoutSlot name="summary-action-label" slots={slots} />
          </button>
        </div>
      </div>
    </section>
  );
}
