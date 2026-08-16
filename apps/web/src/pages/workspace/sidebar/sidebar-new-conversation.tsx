import { useTranslation } from "react-i18next";
import { SidebarNewConversationLayout } from "./layouts";

export function SidebarNewConversation() {
  const { t } = useTranslation();
  return (
    <SidebarNewConversationLayout
      label={t("sidebar.newConversation")}
    />
  );
}
