import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const roots = ["src", "dist"];
const forbidden = [
  ["private export path", /chatgpt-static-export/i],
  ["product branding", /(?:chatgpt|openai)/i],
  ["CSS module hash", /_[a-z][a-z0-9]{4,}_\d+/i],
  ["captured Markdown selector", /markdownContent_[a-z0-9_]+/i],
];
const textExtensions = new Set([".css", ".js", ".json", ".map", ".ts", ".tsx"]);
const binaryExtensions = new Set([".gif", ".jpeg", ".jpg", ".otf", ".png", ".ttf", ".webp", ".woff", ".woff2"]);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(absolute));
    else files.push(absolute);
  }
  return files;
}

const violations = [];
for (const root of roots) {
  for (const file of await filesBelow(path.join(packageRoot, root))) {
    const relative = path.relative(packageRoot, file);
    const extension = path.extname(file).toLowerCase();
    if (binaryExtensions.has(extension) && !/^dist\/styles\/fonts\/KaTeX_[^/]+\.(?:ttf|woff2?)$/.test(relative)) {
      violations.push(`${relative}: unexpected binary asset`);
    }
    if (!textExtensions.has(extension)) continue;
    const source = await readFile(file, "utf8");
    for (const [label, pattern] of forbidden) {
      if (pattern.test(source)) violations.push(`${relative}: ${label}`);
    }
  }
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Public runtime source audit passed.");
