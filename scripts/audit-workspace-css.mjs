import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const cssRoot = join(root, "apps/app/src/styles/codex");
const tokenBridge = join(cssRoot, "ui-token-bridge.css");
const tailwindEntry = join(root, "apps/app/src/styles/tailwind.css");
const legacyUtilities = join(cssRoot, "codex-utilities.css");
const sharedCssFiles = [
  join(root, "apps/app/src/features/workspace/main/main.css"),
  join(root, "apps/app/src/features/workspace/composer/composer.css"),
  join(root, "apps/app/src/features/workspace/composer/utility-bar.css"),
  join(root, "apps/app/src/features/workspace/sidebar/sidebar.css"),
  join(root, "packages/ui/src/components/markdown/markdown.css"),
  join(root, "packages/ui/src/styles/foundation-properties.css"),
  join(root, "packages/ui/src/styles/foundation-reset.css"),
  join(root, "packages/ui/src/styles/foundation-components.css"),
  join(root, "packages/ui/src/styles/vendor/prose-mirror.css"),
  join(root, "packages/ui/src/styles/vendor/code-display.css"),
];
const sourceRoots = [
  join(root, "apps/app/src/features/workspace"),
  join(root, "packages/ui/src"),
];
const sourceExtensions = new Set([".ts", ".tsx"]);

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = sourceRoots
  .flatMap(walk)
  .filter((path) => sourceExtensions.has(extname(path)));
const source = sourceFiles.map((path) => readFileSync(path, "utf8")).join("\n");
const sharedUiSource = walk(join(root, "packages/ui/src"))
  .filter((path) => [".css", ".ts", ".tsx"].includes(extname(path)))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
const cssFiles = walk(cssRoot)
  .filter((path) => extname(path) === ".css" && basename(path) !== "index.css")
  .concat(sharedCssFiles)
  .sort();
const css = cssFiles.map((path) => readFileSync(path, "utf8")).join("\n");
const tokenBridgeSource = readFileSync(tokenBridge, "utf8");
const tailwindSource = readFileSync(tailwindEntry, "utf8");
const classNames = new Set(
  [...css.matchAll(/(?:^|[\s,{>+~])\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/gm)].map(
    (match) => match[1],
  ),
);

const runtimePrefixes = [
  "dark",
  "electron",
  "electron-dark",
  "electron-light",
  "group",
  "hover",
  "light",
  "peer",
];
const generatedUtilityPattern = /^(?:-?[_a-z]+(?:-|$)|@|\[)/;
const referenced = [];
const runtime = [];
const review = [];
const moduleGroups = new Map();
const requiredSharedTokens = [
  "surface-app",
  "surface-main",
  "surface-sidebar",
  "surface-elevated",
  "surface-input",
  "surface-overlay",
  "foreground-primary",
  "foreground-secondary",
  "foreground-tertiary",
  "foreground-inverse",
  "foreground-link",
  "control-primary",
  "control-secondary",
  "interaction-hover",
  "interaction-active",
  "interaction-selected",
  "interaction-muted",
  "interaction-disabled",
  "border-subtle",
  "border-default",
  "border-strong",
  "border-focus",
  "status-success",
  "status-warning",
  "status-danger",
  "status-info",
];
const missingSharedTokens = requiredSharedTokens.filter(
  (token) => !tokenBridgeSource.includes(`--${token}:`),
);

const privateSharedUiPatterns = [
  /--(?:color-token|vscode)-/,
  /(?:bg|text|border|ring)-token-/,
  /data-codex-window-type/,
  /\.electron-(?:dark|light)/,
  /\.pi-(?:workspace|composer)-/,
];
const sharedUiViolation = privateSharedUiPatterns.find((pattern) =>
  pattern.test(sharedUiSource),
);

if (missingSharedTokens.length > 0) {
  throw new Error(`Missing shared UI token mappings: ${missingSharedTokens.join(", ")}`);
}

if (sharedUiViolation) {
  throw new Error(
    `packages/ui depends on an App-private theme or feature contract: ${sharedUiViolation}`,
  );
}

if (existsSync(legacyUtilities)) {
  throw new Error("Static codex-utilities.css snapshot must not be restored");
}

for (const variant of ["browser", "extension", "electron"]) {
  if (!tailwindSource.includes(`@custom-variant ${variant}`)) {
    throw new Error(`Missing Tailwind platform variant: ${variant}`);
  }
}

function getModuleHash(className) {
  return className.match(/^_.+_([a-z0-9]+)_\d+$/)?.[1];
}

for (const className of [...classNames].sort()) {
  const moduleHash = getModuleHash(className);

  if (moduleHash) {
    const group = moduleGroups.get(moduleHash) ?? {
      cssClasses: [],
      referencedClasses: [],
    };
    group.cssClasses.push(className);
    if (source.includes(className)) {
      group.referencedClasses.push(className);
    }
    moduleGroups.set(moduleHash, group);
  }

  if (source.includes(className)) {
    referenced.push(className);
  } else if (
    runtimePrefixes.some((prefix) => className === prefix || className.startsWith(`${prefix}-`)) ||
    generatedUtilityPattern.test(className) && !className.startsWith("_")
  ) {
    runtime.push(className);
  } else {
    review.push(className);
  }
}

console.log(`Codex CSS root: ${relative(root, cssRoot)}`);
console.log(`CSS files scanned: ${cssFiles.length}`);
console.log(`Source files scanned: ${sourceFiles.length}`);
console.log(`Unique CSS classes: ${classNames.size}`);
console.log(`Referenced in source: ${referenced.length}`);
console.log(`Conservatively retained runtime/utilities: ${runtime.length}`);
console.log(`Manual review candidates: ${review.length}`);
console.log(`Shared UI token mappings: ${requiredSharedTokens.length}`);
console.log("\nManual review sample:");
console.log(review.slice(0, 80).join("\n"));
console.log("\nHashed CSS modules with no source class reference:");
console.log(
  [...moduleGroups.entries()]
    .filter(([, group]) => group.referencedClasses.length === 0)
    .sort(([, left], [, right]) => right.cssClasses.length - left.cssClasses.length)
    .map(([hash, group]) => `${hash}\t${group.cssClasses.length}\t${group.cssClasses[0]}`)
    .join("\n"),
);
