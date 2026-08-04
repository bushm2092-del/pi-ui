import { LayoutSlot, type LayoutProps } from "../../layout";

export function AssistantMessageLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"flex flex-col","data-local-conversation-final-assistant":"true"} as any)} {...rootProps}>
      <div {...({"data-content-search-unit-key":"019fc7cf-25d9-7692-929f-bfb716396717:item-5"} as any)}>
        <div {...({"data-response-annotation-conversation":"019fc7cf-24ff-77a0-a094-966a0cd02845","data-response-annotation-target":"item-5","className":"group flex min-w-0 flex-col"} as any)}>
          <h4 {...({"className":"sr-only select-none"} as any)}>
            {"ChatGPT 说："}
          </h4>
          <LayoutSlot name="assistant-markdown" slots={slots} />
          <LayoutSlot name="assistant-actions" slots={slots} />
        </div>
      </div>
    </div>
  );
}
