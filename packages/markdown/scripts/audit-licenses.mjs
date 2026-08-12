import { readFile } from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
const provenance = JSON.parse(await readFile(path.join(packageRoot, "provenance", "third-party-components.json"), "utf8"));
const provenanceByPackage = new Map(provenance.components.map((component) => [component.package, component]));
const approved = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]);
const failures = [];

for (const [name, expectedVersion] of Object.entries(manifest.dependencies ?? {})) {
  const dependencyManifest = JSON.parse(await readFile(path.join(packageRoot, "node_modules", name, "package.json"), "utf8"));
  if (dependencyManifest.version !== expectedVersion) failures.push(`${name}: expected ${expectedVersion}, resolved ${dependencyManifest.version}`);
  if (!approved.has(dependencyManifest.license)) failures.push(`${name}: unapproved or missing license ${dependencyManifest.license ?? "unknown"}`);
  const record = provenanceByPackage.get(name);
  if (!record) failures.push(`${name}: missing provenance record`);
  else {
    if (record.version !== dependencyManifest.version) failures.push(`${name}: provenance version ${record.version} does not match ${dependencyManifest.version}`);
    if (record.license !== dependencyManifest.license) failures.push(`${name}: provenance license ${record.license} does not match ${dependencyManifest.license}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Direct dependency license audit passed.");
