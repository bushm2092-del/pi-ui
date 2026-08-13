import { useTranslation } from "react-i18next";
import { SidebarShortcutsLayout } from "./layouts";

export function SidebarShortcuts() {
  const { t } = useTranslation();
  return <SidebarShortcutsLayout labels={[
    t("sidebar.shortcuts.pullRequests"),
    t("sidebar.shortcuts.scheduled"),
    t("sidebar.shortcuts.plugins"),
  ]} />;
}
