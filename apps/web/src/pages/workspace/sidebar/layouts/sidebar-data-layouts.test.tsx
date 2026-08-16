import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Project, ThreadItem } from "../../data/workspace-data";
import { ProjectItemLayout } from "./project-item-layout";
import { ProjectRowLayout } from "./project-row-layout";
import { ProjectThreadsLayout } from "./project-threads-layout";
import { SidebarProjectsHeaderLayout } from "./sidebar-projects-header-layout";
import { SidebarProjectsLayout } from "./sidebar-projects-layout";
import { SidebarEmptyState } from "./sidebar-empty-state";
import { SidebarPinnedLayout } from "./sidebar-pinned-layout";
import { SidebarRecentsLayout } from "./sidebar-recents-layout";
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

  it("reflects the projects section expanded and collapsed states", () => {
    const expandedMarkup = renderToStaticMarkup(
      <SidebarProjectsLayout
        expanded
        header={
          <SidebarProjectsHeaderLayout
            label="Projects"
            expanded
            onToggle={() => undefined}
          />
        }
        projectList={<div>Project list</div>}
      />,
    );
    const collapsedMarkup = renderToStaticMarkup(
      <SidebarProjectsLayout
        expanded={false}
        header={
          <SidebarProjectsHeaderLayout
            label="Projects"
            expanded={false}
            onToggle={() => undefined}
          />
        }
        projectList={<div>Project list</div>}
      />,
    );

    expect(expandedMarkup).toContain('aria-expanded="true"');
    expect(expandedMarkup).toContain("Project list");
    expect(collapsedMarkup).toContain('aria-expanded="false"');
    expect(collapsedMarkup).toContain(
      'data-app-action-sidebar-section-collapsed="true"',
    );
    expect(collapsedMarkup).toContain(
      'id="sidebar-projects-list" class="overflow-visible" hidden=""',
    );
  });

  it.each([
    ["Pinned", SidebarPinnedLayout, "sidebar-pinned-list"],
    ["Recents", SidebarRecentsLayout, "sidebar-recents-list"],
  ] as const)(
    "reflects the %s section expanded state",
    (label, Layout, listId) => {
      const expandedMarkup = renderToStaticMarkup(
        <Layout label={label} expanded onToggle={() => undefined}>
          <div>Thread list</div>
        </Layout>,
      );
      const collapsedMarkup = renderToStaticMarkup(
        <Layout label={label} expanded={false} onToggle={() => undefined}>
          <div>Thread list</div>
        </Layout>,
      );

      expect(expandedMarkup).toContain('aria-expanded="true"');
      expect(expandedMarkup).toContain(`id="${listId}"`);
      expect(expandedMarkup).not.toContain('hidden=""');
      expect(collapsedMarkup).toContain('aria-expanded="false"');
      expect(collapsedMarkup).toContain('hidden=""');
    },
  );

  it("renders the translated sidebar empty states", async () => {
    await i18n.changeLanguage("zh-CN");
    const markup = renderToStaticMarkup(
      <>
        <SidebarEmptyState label={i18n.t("sidebar.emptyPinned")} />
        <SidebarEmptyState label={i18n.t("sidebar.emptyProjects")} />
        <SidebarEmptyState label={i18n.t("sidebar.emptyRecents")} />
      </>,
    );

    expect(markup).toContain("没有置顶的对话");
    expect(markup).toContain("没有项目");
    expect(markup).toContain("没有对话");
  });
});
