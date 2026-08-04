export function SidebarProjectsLayout({
  header,
  projectList,
}: {
  header: React.ReactNode;
  projectList: React.ReactNode;
}) {
  return (
    <section {...({"className":"relative px-row-x","data-app-action-sidebar-section":"","data-app-action-sidebar-section-collapsed":"false","data-app-action-sidebar-section-heading":"Projects"} as any)}>
      <div {...({"className":"flex flex-col"} as any)}>
        {header}
        <div {...({"className":"overflow-hidden","style":{"height":"auto","opacity":"1","overflow":"visible"}} as any)}>
          <div {...({"className":"flex flex-col gap-px pt-1"} as any)}>
            {projectList}
          </div>
        </div>
      </div>
    </section>
  );
}
