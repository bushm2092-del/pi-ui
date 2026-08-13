import { useTranslation } from "react-i18next";
import { SidebarProjectsHeaderLayout } from "./layouts";

export function SidebarProjectsHeader() {
  const { t } = useTranslation();
  return <SidebarProjectsHeaderLayout label={t("sidebar.sections.projects")} />;
}
