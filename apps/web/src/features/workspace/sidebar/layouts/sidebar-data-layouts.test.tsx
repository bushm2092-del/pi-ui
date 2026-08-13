import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Project, ThreadItem } from "../../data/workspace-data";
import { ProjectItemLayout } from "./project-item-layout";
import { ProjectRowLayout } from "./project-row-layout";
import { ProjectThreadsLayout } from "./project-threads-layout";
import { ThreadItemLayout } from "./thread-item-layout";
import { i18n } from "../../../../i18n";

function makeProject(threads: ThreadItem[] = []): Project {
  return {
    kind: "project",
    id: "project/arbitrary",
    label: "Arbitrary project",
    initialExpanded: true,
    threads,
  };
}

describe("data-driven sidebar layouts", () => {
  it("renders an arbitrary number of threads without indexed slots", () => {
    const threads = Array.from({ length: 7 }, (_, index): ThreadItem => ({
      kind: "thread",
      id: `thread-${index}`,
      label: `Thread ${index}`,
    }));
    const project = makeProject(threads);
    const markup = renderToStaticMarkup(
      <ProjectItemLayout project={project} expanded hideDivider={false}>
        <ProjectRowLayout
          project={project}
          expanded
          onClick={() => undefined}
          onKeyDown={() => undefined}
        />
        <ProjectThreadsLayout project={project}>
          {threads.map((thread) => (
            <ThreadItemLayout
              key={thread.id}
              thread={thread}
              active={thread.id === "thread-6"}
              onSelect={() => undefined}
            />
          ))}
        </ProjectThreadsLayout>
      </ProjectItemLayout>,
    );

    expect(markup).toContain("project/arbitrary");
    expect(markup).toContain("Thread 0");
    expect(markup).toContain("Thread 6");
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
    expect(markup.match(/data-app-action-sidebar-thread-row=""/g)).toHaveLength(7);
  });

  it("renders empty and show-more variants from data", () => {
    const emptyProject = makeProject();
    const emptyMarkup = renderToStaticMarkup(
      <ProjectThreadsLayout project={emptyProject}>{null}</ProjectThreadsLayout>,
    );
    const showMoreMarkup = renderToStaticMarkup(
      <ThreadItemLayout
        thread={{ kind: "show-more", id: "more", label: "展开显示" }}
        active={false}
        onSelect={() => undefined}
      />,
    );

    expect(emptyMarkup).toContain("没有聊天");
    expect(showMoreMarkup).toContain("展开显示");
    expect(showMoreMarkup).not.toContain("data-app-action-sidebar-thread-row");
  });

  it("renders sidebar labels in the selected language", async () => {
    await i18n.changeLanguage("en-US");
    const markup = renderToStaticMarkup(
      <ProjectThreadsLayout project={makeProject()}>{null}</ProjectThreadsLayout>,
    );

    expect(markup).toContain("No chats");
    await i18n.changeLanguage("zh-CN");
  });
});
