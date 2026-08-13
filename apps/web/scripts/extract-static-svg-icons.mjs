import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(appRoot, "../..");
const sourcePath = resolve(workspaceRoot, "chatgpt-static-export/index.html");
const outputDir = resolve(appRoot, "src/assets/svg");
const parse5Path = resolve(
  workspaceRoot,
  "node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/index.js",
);
const semanticNames = [
  "chevron-down",
  "search",
  "notification",
  "new-conversation",
  "pull-request",
  "scheduled",
  "plugins",
  "more-horizontal",
  "plus",
  "project-folder",
  "pin",
  "archive",
  "scheduled-folder",
  "continue-in-new-conversation",
  "settings",
  "help-circle",
  "sidebar-toggle",
  "arrow-horizontal",
  "folder-tab",
  "summary-toggle",
  "bottom-panel-toggle",
  "copy",
  "word-wrap",
  "edit",
  "link",
  "check",
  "github",
  "mail",
  "image",
  "expand",
  "math-radical",
  "math-bracket-left",
  "math-bracket-right",
  "mermaid-flowchart",
  "mermaid-sequence-diagram",
  "mermaid-gantt-chart",
  "globe",
  "arrow-up",
  "permissions-shield",
  "changes",
  "local-workspace",
  "git-branch",
  "commit-and-push",
  "side-conversation-small",
  "side-conversation",
  "close",
  "selected-text",
  "workspace-folder",
];
const { parse, serialize } = await import(pathToFileURL(parse5Path).href);

const html = await readFile(sourcePath, "utf8");
const document = parse(html, { sourceCodeLocationInfo: true });
const instances = [];
walk(document, [], instances);

const groups = new Map();
for (const instance of instances) {
  const canonical = canonicalSvg(instance.node);
  const hash = createHash("sha256").update(canonical).digest("hex").slice(0, 12);
  const group = groups.get(hash) ?? { hash, canonical, instances: [] };
  group.instances.push(instance);
  groups.set(hash, group);
}

const icons = [...groups.values()].sort((left, right) =>
  firstOffset(left) - firstOffset(right)
);
if (icons.length !== semanticNames.length) {
  throw new Error(
    `Expected ${semanticNames.length} unique SVGs, found ${icons.length}. Update semanticNames for the new snapshot.`,
  );
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const manifest = {
  source: "chatgpt-static-export/index.html",
  instanceCount: instances.length,
  uniqueCount: icons.length,
  icons: [],
};

for (const [index, icon] of icons.entries()) {
  const name = `${semanticNames[index]}.svg`;
  await writeFile(resolve(outputDir, name), formatSvg(icon.canonical), "utf8");
  manifest.icons.push({
    file: name,
    hash: icon.hash,
    count: icon.instances.length,
    viewBox: attr(icon.instances[0].node, "viewBox"),
    width: attr(icon.instances[0].node, "width"),
    height: attr(icon.instances[0].node, "height"),
    contexts: unique(icon.instances.map((item) => item.context).filter(Boolean)),
    sourceOffsets: icon.instances
      .map((item) => item.node.sourceCodeLocation?.startOffset)
      .filter(Number.isInteger),
  });
}

await writeFile(
  resolve(outputDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
await writeFile(
  resolve(outputDir, "README.md"),
  `# Static SVG assets

Generated from \`chatgpt-static-export/index.html\`.

- Source instances: ${instances.length}
- Unique SVGs: ${icons.length}
- Naming: semantic kebab-case names derived from the rendered context and SVG contents
- Deduplication: normalized SVG markup, excluding runtime \`class\`, \`style\`, and accessibility attributes
- Metadata: see \`manifest.json\` for occurrence counts, dimensions, contexts, and source offsets

Regenerate from the repository root:

\`\`\`bash
node apps/app/scripts/extract-static-svg-icons.mjs
\`\`\`
`,
  "utf8",
);

process.stdout.write(
  `Extracted ${instances.length} SVG instances into ${icons.length} unique assets.\n`,
);

function walk(node, ancestors, results) {
  const nextAncestors = node.tagName ? [...ancestors, node] : ancestors;
  if (node.tagName === "svg") {
    results.push({ node, context: findContext(ancestors) });
    return;
  }
  for (const child of node.childNodes ?? []) walk(child, nextAncestors, results);
}

function canonicalSvg(node) {
  const clone = structuredClone(node);
  cleanNode(clone);
  clone.parentNode = null;
  return serialize({
    nodeName: "#document-fragment",
    childNodes: [clone],
  }).trim();
}

function cleanNode(node) {
  if (node.attrs) {
    node.attrs = node.attrs
      .filter(({ name }) => !["class", "style", "aria-hidden", "aria-label"].includes(name))
      .sort((left, right) => left.name.localeCompare(right.name));
  }
  for (const child of node.childNodes ?? []) cleanNode(child);
}

function findContext(ancestors) {
  for (const node of [...ancestors].reverse()) {
    const label = attr(node, "aria-label");
    if (label) return label.trim();
    if (["button", "a"].includes(node.tagName)) {
      const text = textContent(node).replace(/\s+/g, " ").trim();
      if (text) return text.slice(0, 120);
    }
  }
  return "";
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(textContent).join("");
}

function attr(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value ?? null;
}

function unique(values) {
  return [...new Set(values)];
}

function firstOffset(group) {
  return group.instances[0].node.sourceCodeLocation?.startOffset ?? Number.MAX_SAFE_INTEGER;
}

function formatSvg(value) {
  return `${value.replace(/></g, ">\n  <").replace(/\n  <\/svg>$/, "\n</svg>")}\n`;
}
