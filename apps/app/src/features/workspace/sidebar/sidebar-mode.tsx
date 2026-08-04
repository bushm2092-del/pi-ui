import { workspaceData } from "../data/workspace-data";
import { SidebarModeLayout } from "./layouts";

function ModeLabel() {
  return (
    <span className="truncate font-openai-sans font-semibold">
      {workspaceData.chrome.product.modeLabelParts.map((part, index) => (
        <span key={index} style={{ color: part.color, fontWeight: "700" }}>
          {part.text}
        </span>
      ))}
    </span>
  );
}

export function SidebarMode() {
  return <SidebarModeLayout label={<ModeLabel />} />;
}
