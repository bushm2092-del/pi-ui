export function ComposerReasoningLayout() {
  return (
    <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent h-token-button-composer px-2 py-0 text-sm leading-[18px] min-w-0","aria-expanded":"false","aria-haspopup":"menu","data-codex-intelligence-trigger":"true","data-composer-navigation-target":"reasoning","data-selected-reasoning-effort":"low","data-state":"closed"} as any)}>
      <span {...({"className":"pi-composer-dropdown-label inline-flex min-w-0 items-center gap-1 text-left"} as any)}>
        <span {...({"className":"pi-composer-dropdown-value min-w-0 truncate font-normal whitespace-nowrap text-token-text-tertiary [&_svg]:size-4 [&_svg]:text-current max-w-40"} as any)}>
          <span {...({"className":"pi-composer-dropdown-value-content block max-w-full min-w-0 truncate text-token-text-tertiary","data-tooltip-overflow-target":"true"} as any)}>
            <span {...({"className":"flex max-w-40 min-w-0 items-center gap-1.5"} as any)}>
              <span {...({"className":"flex min-w-0 items-center gap-1 tabular-nums"} as any)}>
                <span {...({"className":"truncate whitespace-nowrap"} as any)}>
                  {"5.6 Sol"}
                </span>
              </span>
              <span {...({"className":"pi-composer-label-sm shrink-0"} as any)}>
                {"轻度"}
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
