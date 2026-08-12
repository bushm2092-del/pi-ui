import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const stylesRoot = path.join(packageRoot, "src", "styles");
const sourceRoot = path.join(packageRoot, "src");
const provenance = JSON.parse(await readFile(path.join(packageRoot, "provenance", "css-modules.json"), "utf8"));

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesBelow(absolute));
    else result.push(absolute);
  }
  return result;
}

const cssFiles = (await filesBelow(stylesRoot))
  .filter((file) => file.endsWith(".css"))
  .map((file) => path.relative(packageRoot, file))
  .sort();
const recorded = provenance.modules.map((module) => module.file).sort();
const violations = [];
for (const file of cssFiles) if (!recorded.includes(file)) violations.push(`${file}: missing provenance record`);
for (const file of recorded) if (!cssFiles.includes(file)) violations.push(`${file}: provenance points to a missing CSS file`);

const css = (await Promise.all(cssFiles.map((file) => readFile(path.join(packageRoot, file), "utf8")))).join("\n");
const sourceFiles = (await filesBelow(sourceRoot)).filter((file) => /\.(?:ts|tsx)$/.test(file));
const classNames = new Set();
for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/smk-markdown(?:-[a-z0-9]+)+(?:--[a-z0-9]+)?/g)) {
    if (match.index && source[match.index - 1] === "-") continue;
    classNames.add(match[0]);
  }
}
for (const className of classNames) {
  if (!css.includes(`.${className}`)) violations.push(`${className}: renderer class has no CSS definition`);
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(`CSS contract audit passed (${cssFiles.length} modules, ${classNames.size} renderer classes).`);
