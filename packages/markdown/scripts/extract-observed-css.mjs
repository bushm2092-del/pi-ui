import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const sourceArgument = process.argv.slice(2).find((argument) => argument !== "--");
const writePackageCss = process.argv.includes("--write-package");
if (!sourceArgument) {
  console.error("Usage: node scripts/extract-observed-css.mjs <captured-stylesheet>");
  process.exit(1);
}

const packageRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.resolve(process.cwd(), sourceArgument);
const outputDirectory = path.join(packageRoot, ".local-reference");
const source = await readFile(sourcePath, "utf8");
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const root = postcss.parse(source, { from: sourcePath });

let anchorRule;
root.walkRules((rule) => {
  if (anchorRule) return;
  const properties = new Set(rule.nodes.filter((node) => node.type === "decl").map((node) => node.prop));
  if (properties.has("--markdown-font-size") && properties.has("--markdown-line-height")) anchorRule = rule;
});

if (!anchorRule) {
  console.error("Could not locate a Markdown content module in the supplied stylesheet.");
  process.exit(1);
}

const anchorClass = anchorRule.selector.match(/\.(_[A-Za-z][\w-]*_([a-z0-9]+)_\d+)/);
if (!anchorClass) {
  console.error("The located Markdown rule does not use a recognizable CSS Module selector.");
  process.exit(1);
}

const moduleKey = anchorClass[2];
const moduleMarker = `_${moduleKey}_`;
const classPattern = new RegExp(`\\._([A-Za-z][\\w-]*)_${moduleKey}_\\d+`, "g");
const animationPattern = new RegExp(`_([A-Za-z][\\w-]*)_${moduleKey}_\\d+`, "g");
const selectedRules = [];

const roleSelectors = {
  blockquote: ".smk-markdown-blockquote",
  codeBlock: ".smk-markdown-code-block",
  codeBlockPlaceholder: ".smk-markdown-code-placeholder",
  fadeIn: "[data-sd-animate]",
  fadeListDecoration: ".smk-markdown-list-item",
  heading: ".smk-markdown-heading",
  heading1: ".smk-markdown-heading--1",
  heading2: ".smk-markdown-heading--2",
  heading3: ".smk-markdown-heading--3",
  heading4: ".smk-markdown-heading--4",
  heading5: ".smk-markdown-heading--5",
  heading6: ".smk-markdown-heading--6",
  horizontalRule: ".smk-markdown-horizontal-rule",
  imageEnter: ".smk-markdown-image",
  inlineMarkdown: ".smk-markdown-inline-code",
  inlineMarkdownIsolate: ".smk-markdown-inline-code",
  list: ".smk-markdown-list",
  listItem: ".smk-markdown-list-item",
  markdownBlock: ".smk-markdown-block",
  markdownContent: ".smk-markdown",
  markdownContentTertiary: ".smk-markdown--tertiary",
  markdownRoot: ".smk-markdown",
  markdownText: ".smk-markdown-text",
  markdownTextSmall: ".smk-markdown-text--small",
  mediaGridParagraph: ".smk-markdown-media-grid",
  mediaParagraph: ".smk-markdown-media-paragraph",
  mediaWideBlock: ".smk-markdown-media-grid",
  mermaidBlock: ".smk-markdown-mermaid",
  mermaidExpandButton: ".smk-markdown-mermaid-expand",
  mermaidSurface: ".smk-markdown-mermaid-surface",
  mermaidWideBlock: ".smk-markdown-mermaid",
  numericTableCell: ".smk-markdown-table-cell--numeric",
  orderedList: ".smk-markdown-list--ordered",
  paragraph: ".smk-markdown-paragraph",
  singleChildTableCell: ".smk-markdown-table-cell--single",
  table: ".smk-markdown-table",
  tableActions: ".smk-markdown-table-actions",
  tableBody: ".smk-markdown-table-body",
  tableCell: ".smk-markdown-table-cell",
  tableCellFileLink: ".smk-markdown-table-cell-file-link",
  tableContainer: ".smk-markdown-table-container",
  tableHeaderCell: ".smk-markdown-table-header-cell",
  tableRow: ".smk-markdown-table-row",
  tableScroller: ".smk-markdown-table-scroller",
  tableWideBlock: ".smk-markdown-table-container",
  tableWrapper: ".smk-markdown-table-wrapper",
  taskList: ".contains-task-list",
  taskListItem: ".task-list-item",
  unorderedList: ".smk-markdown-list--unordered",
  visualizationWideBlock: ".smk-markdown-visualization",
};

const variableReplacements = new Map([
  ["var(--codex-chat-font-size)", "var(--smk-markdown-font-size)"],
  ["var(--codex-chat-code-font-size)", "var(--smk-markdown-font-size)"],
  ["var(--markdown-font-size)", "var(--smk-markdown-font-size)"],
  ["var(--markdown-line-height)", "var(--smk-markdown-line-height)"],
  ["var(--color-token-text-primary)", "var(--smk-markdown-text)"],
  ["var(--color-token-text-tertiary)", "var(--smk-markdown-text-secondary)"],
  ["var(--color-token-border-heavy)", "var(--smk-markdown-border)"],
  ["var(--color-token-border-light)", "var(--smk-markdown-border-subtle)"],
  ["var(--color-token-bg-secondary)", "var(--smk-markdown-surface)"],
  ["var(--color-token-bg-primary)", "var(--smk-markdown-surface-raised)"],
  ["var(--color-token-text-code-block-background)", "var(--smk-markdown-code-surface)"],
  ["var(--color-token-list-hover-background)", "var(--smk-markdown-hover)"],
  ["var(--color-token-foreground)", "var(--smk-markdown-text)"],
  ["var(--font-mono)", "var(--smk-markdown-code-font)"],
  ["var(--thread-content-margin,24px)", "var(--smk-markdown-content-margin)"],
  ["var(--thread-content-max-width,40rem)", "var(--smk-markdown-content-max-width)"],
  ["var(--markdown-wide-block-max-width)", "var(--smk-markdown-wide-block-max-width)"],
  ["var(--padding-toolbar)", "0px"],
  ["var(--spacing)", "4px"],
  ["var(--thread-wide-block-inline-shift,0px)", "0px"],
  ["var(--radius-lg)", "10px"],
  ["var(--text-primary)", "var(--smk-markdown-text)"],
  ["var(--border-medium)", "var(--smk-markdown-border)"],
  ["var(--border-light)", "var(--smk-markdown-border-subtle)"],
]);

function fallbackSelector(role) {
  return `.smk-markdown-observed-${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function packageSelector(selector) {
  return selector
    .replace(/\[data-codex-window-type="extension"\]\s+/g, "")
    .replace(/:is\(\[data-codex-window-type="browser"\], \[data-codex-window-type="electron"\]\)\s+/g, "")
    .replace(/\.reference-([A-Za-z][\w-]*)/g, (_, role) => roleSelectors[role] ?? fallbackSelector(role));
}

function packageValue(value) {
  let result = value;
  for (const [sourceValue, targetValue] of variableReplacements) result = result.replaceAll(sourceValue, targetValue);
  return result;
}

root.walkRules((rule) => {
  if (!rule.selector.includes(moduleMarker)) return;
  const clone = rule.clone();
  clone.selector = clone.selector.replace(classPattern, (_, role) => `.reference-${role}`);
  clone.walkDecls((declaration) => {
    declaration.value = declaration.value.replace(animationPattern, (_, role) => `reference-${role}`);
  });
  selectedRules.push({
    css: clone.toString(),
    media: rule.parent?.type === "atrule" && rule.parent.name === "media" ? rule.parent.params : undefined,
    selector: clone.selector,
    declarations: clone.nodes
      .filter((node) => node.type === "decl")
      .map((declaration) => ({ property: declaration.prop, value: declaration.value })),
  });
});

// Compare the snapshot against the handwritten baseline only. The generated parity
// layer is expected to contain the remaining declarations and would make this metric
// circular on subsequent runs.
const styleFiles = ["contract.css", "content.css", "code.css", "table.css", "math.css", "mermaid.css", "streaming.css"];
const packageCss = (await Promise.all(styleFiles.map((file) => readFile(path.join(packageRoot, "src", "styles", file), "utf8")))).join("\n");
const packageRootCss = postcss.parse(packageCss);
const packageDeclarations = new Set();
packageRootCss.walkDecls((declaration) => {
  packageDeclarations.add(`${declaration.prop}:${declaration.value.replace(/\s+/g, " ").trim()}`);
});

const declarationInventory = new Map();
for (const rule of selectedRules) {
  for (const declaration of rule.declarations) {
    if (!declaration.value.trim()) continue;
    const key = `${declaration.property}:${packageValue(declaration.value).replace(/\s+/g, " ").trim()}`;
    if (!declarationInventory.has(key)) declarationInventory.set(key, []);
    declarationInventory.get(key).push(rule.selector);
  }
}

const unmatchedDeclarations = [...declarationInventory.entries()]
  .filter(([declaration]) => !packageDeclarations.has(declaration))
  .map(([declaration, selectors]) => ({ declaration, selectors }))
  .sort((left, right) => left.declaration.localeCompare(right.declaration));

const transformedCss = selectedRules.map((rule) => rule.media
  ? `@media ${rule.media} {\n${rule.css}\n}`
  : rule.css).join("\n\n");
const report = {
  schemaVersion: 2,
  sourceSha256,
  selectedRuleCount: selectedRules.length,
  uniqueDeclarationCount: declarationInventory.size,
  handwrittenBaselineMissingCount: unmatchedDeclarations.length,
  handwrittenBaselineMissingDeclarations: unmatchedDeclarations,
};

await mkdir(outputDirectory, { recursive: true });
const writes = [
  writeFile(path.join(outputDirectory, "observed-markdown.css"), transformedCss),
  writeFile(path.join(outputDirectory, "observed-markdown-report.json"), `${JSON.stringify(report, null, 2)}\n`),
];

if (writePackageCss) {
  const packageRules = selectedRules
    // Export snapshots contain replay-only opacity rules whose animation names
    // are empty after serialization. They are evidence, not package runtime CSS.
    .filter((rule) => !rule.selector.includes(".reference-markdownRoot"))
    .map((rule) => {
    const parsed = postcss.parse(rule.css);
    parsed.walkRules((parsedRule) => { parsedRule.selector = packageSelector(parsedRule.selector); });
    parsed.walkDecls((declaration) => {
      if (!declaration.value.trim()) declaration.remove();
      else declaration.value = packageValue(declaration.value);
    });
    const css = parsed.toString();
    return rule.media ? `@media ${rule.media} {\n${css}\n}` : css;
    }).join("\n\n");
  const generatedDirectory = path.join(packageRoot, "src", "styles", "generated");
  await mkdir(generatedDirectory, { recursive: true });
  const generatedAt = new Date().toISOString();
  const header = [
    "/* Snapshot-derived experimental CSS; do not edit manually.",
    ` * Source SHA-256: ${sourceSha256}`,
    ` * Generated at: ${generatedAt}`,
    " */",
  ].join("\n");
  writes.push(writeFile(path.join(generatedDirectory, "product-parity.css"), `${header}\n${packageRules}\n`));
}

await Promise.all(writes);

console.log(`Extracted ${selectedRules.length} Markdown rules.`);
console.log(`${unmatchedDeclarations.length} of ${declarationInventory.size} normalized declarations are supplied by the generated parity layer rather than the handwritten baseline.`);
console.log(`Local output: ${outputDirectory}`);
if (writePackageCss) console.log("Updated src/styles/generated/product-parity.css.");
