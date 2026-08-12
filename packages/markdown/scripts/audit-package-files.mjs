import { execFileSync } from "node:child_process";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
  cwd: packageRoot,
  encoding: "utf8",
});
const [{ files }] = JSON.parse(output);
const allowedTopLevel = new Set(["LICENSE", "README.md", "THIRD_PARTY_NOTICES.md", "package.json"]);
const violations = files
  .map(({ path: file }) => file)
  .filter((file) => !file.startsWith("dist/") && !allowedTopLevel.has(file));

if (violations.length) {
  console.error(`Unexpected package files:\n${violations.join("\n")}`);
  process.exit(1);
}
console.log(`Package file audit passed (${files.length} files).`);
