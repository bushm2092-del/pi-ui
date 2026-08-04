import { LayoutSlot, type LayoutProps } from "../../layout";

export function ThreadFooterLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"data-thread-scroll-footer":"true","className":"sticky bottom-0 z-10 mt-auto w-full pb-4"} as any)} {...rootProps}>
      <div {...({"className":"pointer-events-none absolute inset-x-0 bottom-0 z-0 flex h-full w-full justify-center pt-4"} as any)}>
        <div {...({"className":"mx-auto w-full max-w-(--thread-content-max-width) px-toolbar z-0 h-full bg-gradient-to-t from-token-main-surface-primary via-token-main-surface-primary extension:from-token-bg-primary extension:via-token-bg-primary"} as any)} />
      </div>
      <div {...({"data-pip-obstacle":"thread-footer","className":"relative z-10 flex flex-col mx-auto w-full max-w-(--thread-content-max-width) px-toolbar"} as any)}>
        <div {...({"className":"flex flex-col","data-thread-find-composer":"true"} as any)}>
          <div {...({"className":"relative h-0"} as any)}>
            <button {...({"className":"cursor-interaction absolute z-30 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-token-border-default bg-token-main-surface-primary bg-clip-padding text-token-text-secondary transition-opacity duration-basic ease-in-out end-1/2 print:hidden pointer-events-none opacity-0 bottom-[calc(100%+6*var(--spacing))]","aria-hidden":"true","aria-label":"滚动到底部","type":"button","tabIndex":"-1"} as any)}>
              <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon rotate-180 text-token-text-primary"} as any)}>
                <path {...({"d":"M9.33467 16.6663V4.93978L4.6374 9.63704L4.1667 9.16634L3.69599 8.69661L9.52998 2.86263L9.63447 2.77767C9.8925 2.60753 10.2433 2.63564 10.4704 2.86263L16.3034 8.69661L16.3884 8.80111C16.5588 9.05922 16.5306 9.40982 16.3034 9.63704C16.0762 9.86414 15.7255 9.89242 15.4675 9.722L15.363 9.63704L10.6647 4.9388V16.6663C10.6647 17.0336 10.367 17.3314 9.99971 17.3314C9.63259 17.3312 9.33467 17.0335 9.33467 16.6663ZM4.6374 9.63704C4.3777 9.89674 3.95569 9.89674 3.69599 9.63704C3.43657 9.37744 3.43668 8.95628 3.69599 8.69661L4.6374 9.63704Z","fill":"currentColor"} as any)} />
              </svg>
            </button>
          </div>
          <div {...({"className":"flex flex-col gap-2"} as any)}>
            <LayoutSlot name="composer" slots={slots} />
          </div>
        </div>
      </div>
    </div>
  );
}
