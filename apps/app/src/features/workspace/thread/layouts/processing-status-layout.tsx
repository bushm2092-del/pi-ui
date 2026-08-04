import { LayoutSlot, type LayoutProps } from "../../layout";

export function ProcessingStatusLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"flex flex-col"} as any)} {...rootProps}>
      <div {...({"className":"text-size-chat text-token-text-secondary"} as any)}>
        <button {...({"type":"button","className":"inline-flex items-center gap-1 rounded-md border border-transparent text-size-chat focus-visible:ring-2 focus-visible:ring-token-focus-border focus-visible:outline-none","aria-expanded":"false"} as any)}>
          <span>
            <LayoutSlot name="processing-label" slots={slots} />
          </span>
          <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-2xs text-token-conversation-summary-trailing transition-transform duration-basic rotate-0"} as any)}>
            <path {...({"d":"M7.52925 3.7793C7.75652 3.55203 8.10803 3.52383 8.36616 3.69434L8.47065 3.7793L14.2207 9.5293C14.4804 9.789 14.4804 10.211 14.2207 10.4707L8.47065 16.2207C8.21095 16.4804 7.78895 16.4804 7.52925 16.2207C7.26955 15.961 7.26955 15.539 7.52925 15.2793L12.8085 10L7.52925 4.7207L7.44429 4.61621C7.27378 4.35808 7.30198 4.00657 7.52925 3.7793Z","fill":"currentColor"} as any)} />
          </svg>
        </button>
      </div>
      <div {...({"className":"pt-1 text-size-chat text-token-text-secondary"} as any)}>
        <div {...({"className":"w-full border-t border-token-border"} as any)} />
      </div>
    </div>
  );
}
