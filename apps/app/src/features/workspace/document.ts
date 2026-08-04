import "./workspace.css";
import { workspaceDocumentAttributes } from "./document-attributes";
import { workspaceData } from "./data/workspace-data";

function copyAttributes(source: Record<string, string>, target: Element) {
  for (const [name, value] of Object.entries(source)) {
    target.setAttribute(name, value);
  }
}

export function installWorkspaceDocument() {
  copyAttributes(workspaceDocumentAttributes.html, document.documentElement);
  copyAttributes(workspaceDocumentAttributes.body, document.body);
  document.title = workspaceData.chrome.product.appName;

}
