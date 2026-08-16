export function SidebarProjectsLayout({
  expanded,
  header,
  projectList,
}: {
  expanded: boolean;
  header: React.ReactNode;
  projectList: React.ReactNode;
}) {
  return (
    <section
      className="relative px-row-x"
      data-app-action-sidebar-section=""
      data-app-action-sidebar-section-collapsed={String(!expanded)}
      data-app-action-sidebar-section-heading="Projects"
    >
      <div {...({"className":"flex flex-col"} as any)}>
        {header}
        <div
          id="sidebar-projects-list"
          className="overflow-visible"
          hidden={!expanded}
        >
          <div className="flex flex-col gap-px pt-1">
            {projectList}
          </div>
        </div>
      </div>
    </section>
  );
}
