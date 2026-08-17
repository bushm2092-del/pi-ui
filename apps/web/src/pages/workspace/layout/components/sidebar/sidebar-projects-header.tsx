import { useTranslation } from "react-i18next";
import { SidebarProjectsHeaderLayout } from "./layouts";

export function SidebarProjectsHeader({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SidebarProjectsHeaderLayout
      label={t("sidebar.sections.projects")}
      expanded={expanded}
      onToggle={onToggle}
    />
  );
}
