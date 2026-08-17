import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RootLayout } from "../../layout";
import { AssistantMessageLayout } from "./assistant-message-layout";
import { ConversationLayout } from "./conversation-layout";
import { ProcessingStatusLayout } from "./processing-status-layout";
import { ThreadFooterLayout } from "./thread-footer-layout";
import { ThreadFrameLayout } from "./thread-frame-layout";
import { TimelineScrollLayout } from "./timeline-scroll-layout";
import { UserMessageLayout } from "./user-message-layout";

describe("thread layouts", () => {
  it("renders typed message content and status without named slots", () => {
    const user = renderToStaticMarkup(
      <UserMessageLayout
        content={<span>user content</span>}
        actions={<button type="button">user action</button>}
      />,
    );
    const assistant = renderToStaticMarkup(
      <AssistantMessageLayout
        status="failed"
        markdown={<p>assistant content</p>}
        actions={<button type="button">assistant action</button>}
      />,
    );

    expect(user).toContain("user content");
    expect(user).toContain("user action");
    expect(user).toContain("data-user-message-bubble=\"true\"");
    expect(assistant).toContain("data-message-status=\"failed\"");
    expect(assistant).toContain("assistant content");
    expect(assistant).toContain("assistant action");
  });

  it("keeps conversation, timeline, footer, and summary boundaries", () => {
    const markup = renderToStaticMarkup(
      <ThreadFrameLayout
        timeline={
          <TimelineScrollLayout
            conversation={
              <ConversationLayout>
                <div data-test="message-list">messages</div>
              </ConversationLayout>
            }
            footer={<ThreadFooterLayout composer={<div>composer</div>} />}
          />
        }
        summary={<aside>summary</aside>}
      />,
    );

    expect(markup).toContain("data-app-shell-thread-edge-divider=\"true\"");
    expect(markup).toContain("data-pip-anchor-host=\"codex-main-thread\"");
    expect(markup).toContain("data-thread-find-target=\"conversation\"");
    expect(markup).toContain("data-thread-scroll-footer=\"true\"");
    expect(markup.indexOf("messages")).toBeLessThan(markup.indexOf("composer"));
    expect(markup.indexOf("composer")).toBeLessThan(markup.indexOf("summary"));
  });

  it("renders processing and workspace regions from explicit nodes", () => {
    const processing = renderToStaticMarkup(
      <ProcessingStatusLayout label={<span>processing</span>} />,
    );
    const workspace = renderToStaticMarkup(
      <RootLayout
        sidebar={<aside data-test="sidebar">sidebar</aside>}
        mainSurface={<main data-test="main">main</main>}
      />,
    );

    expect(processing).toContain("processing");
    expect(workspace).toContain("data-test=\"sidebar\"");
    expect(workspace).toContain("data-test=\"main\"");
    expect(workspace.indexOf("sidebar")).toBeLessThan(workspace.indexOf("main"));
  });
});
