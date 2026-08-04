import type { LayoutProps } from "../../layout";

export function ProjectItemLayout5({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"flex gap-1 py-1 after:block after:h-px after:content-[''] last:after:hidden","role":"listitem"} as any)} {...rootProps}>
      <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent px-2 py-0.5 text-sm leading-[18px] !text-base !text-token-input-placeholder-foreground !opacity-75 hover:!text-token-foreground"} as any)}>
        {"展开显示"}
      </button>
    </div>
  );
}
