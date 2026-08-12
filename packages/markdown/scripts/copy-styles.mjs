import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = new URL("../src/styles/", import.meta.url);
const destination = new URL("../dist/styles/", import.meta.url);
const katexCss = new URL("../node_modules/katex/dist/katex.min.css", import.meta.url);
const katexFonts = new URL("../node_modules/katex/dist/fonts/", import.meta.url);
const katexLicense = new URL("../node_modules/katex/LICENSE", import.meta.url);
const licensesDestination = new URL("../dist/licenses/", import.meta.url);

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await cp(katexCss, new URL("katex.min.css", destination));
await cp(katexFonts, new URL("fonts/", destination), { recursive: true });
await mkdir(licensesDestination, { recursive: true });
await cp(katexLicense, new URL("katex.txt", licensesDestination));

console.log(
  `Copied Markdown and licensed KaTeX styles to ${fileURLToPath(destination)}`,
);
