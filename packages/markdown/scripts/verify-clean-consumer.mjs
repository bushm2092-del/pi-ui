import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "streaming-markdown-kit-consumer-"));
let tarball;

try {
  const packResult = JSON.parse(execFileSync("npm", ["pack", "--json", "--ignore-scripts"], { cwd: packageRoot, encoding: "utf8" }));
  tarball = path.join(packageRoot, packResult[0].filename);
  await writeFile(path.join(temporaryRoot, "package.json"), JSON.stringify({ name: "clean-consumer", private: true, type: "module" }, null, 2));
  await writeFile(path.join(temporaryRoot, "index.mjs"), `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticMarkdown, markdownTableToMarkdown } from "streaming-markdown-kit";

const html = renderToStaticMarkup(React.createElement(StaticMarkdown, { preset: "base" }, "# Clean consumer"));
if (!html.includes("smk-markdown-heading")) throw new Error("Package renderer did not execute");
if (!markdownTableToMarkdown({ headers: ["A"], rows: [["1"]] }).includes("| A |")) throw new Error("Package utility did not execute");
console.log("Clean tarball consumer rendered successfully.");
`);
  const reactVersion = JSON.parse(await readFile(path.join(packageRoot, "node_modules", "react", "package.json"), "utf8")).version;
  const reactDomVersion = JSON.parse(await readFile(path.join(packageRoot, "node_modules", "react-dom", "package.json"), "utf8")).version;
  execFileSync("pnpm", ["add", "--offline", tarball, `react@${reactVersion}`, `react-dom@${reactDomVersion}`], { cwd: temporaryRoot, stdio: "inherit" });
  execFileSync(process.execPath, ["index.mjs"], { cwd: temporaryRoot, stdio: "inherit" });

  const installedManifest = JSON.parse(await readFile(path.join(temporaryRoot, "node_modules", "streaming-markdown-kit", "package.json"), "utf8"));
  if (installedManifest.name !== "streaming-markdown-kit") throw new Error("Unexpected installed package");
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
  if (tarball) await rm(tarball, { force: true });
}
