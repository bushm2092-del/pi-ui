# Experimental streaming Markdown package architecture

## 1. Objective

Build an internal visual-replication experiment whose rendered output, interaction model,
streaming behavior, and visual quality closely reproduce the observable Markdown experience
in the supplied desktop static export.

The package uses Streamdown as its streaming Markdown engine, while retaining ownership
of the public API, React renderers, DOM contract, interactions, theme contract, and CSS.
The source static export is research input and is excluded from the package tarball. A
PostCSS research tool may extract its Markdown module, map selectors and variables onto the
package contract, and write a generated parity layer. This makes the experiment
snapshot-derived rather than a clean-room implementation.

Local research inputs may include an HTML snapshot, its stylesheet, and capture metadata.
They may live in the working copy for the experiment but must remain outside the npm tarball.

The observed product currently demonstrates headings, nested lists, read-only task lists,
blockquotes, tables, code blocks, rich links, KaTeX, Mermaid, wide blocks, copying,
expansion controls, and streaming animation styles.

## 2. Architecture decision

The final composition is:

```text
AI message stream
       |
       v
Streamdown parsing and streaming runtime
       |
       v
streaming-markdown-kit AST transforms and renderers
       |
       v
Stable package-owned semantic DOM contract
       |
       v
Independently authored Markdown CSS
       |
       v
Host application theme and integration adapters
```

Streamdown owns:

- Recovery from incomplete streaming Markdown.
- Markdown parsing and AST/HTML processing.
- GFM and CJK processing.
- Code, math, and Mermaid plugin scheduling.
- Base sanitization and URL hardening.
- Stable processing of incomplete code fences.

`streaming-markdown-kit` owns:

- A lossless compatibility surface for Streamdown's public exports and props.
- Project-owned preset components, renderers, plugins, styles, and types.
- All rendered elements, classes, and data attributes.
- Package-owned layout and CSS targeting measured visual parity.
- Code, table, task-list, Mermaid, and copy interactions.
- Streaming presentation and reduced-motion behavior.
- Extension points for links, files, citations, media, and dialogs.

Applications own:

- Theme token mapping.
- Navigation and external URL behavior.
- File-reference resolution.
- Citation data and source navigation.
- Image proxying and authorization.
- Dialog/overlay integration where an application shell is required.

Application code imports from `streaming-markdown-kit` rather than mixing imports from two packages.
The package root re-exports Streamdown's public API, while package-owned names are prefixed
with `Pi` to avoid collisions. A Streamdown upgrade is accepted only after the compatibility
suite confirms that no upstream export or supported prop has been lost.

## 3. Package layout

```text
packages/markdown/
|-- package.json
|-- tsconfig.json
|-- src/
|   |-- index.ts
|   |-- streaming-markdown.tsx
|   |-- static-markdown.tsx
|   |-- types.ts
|   |-- runtime/
|   |   |-- preset.ts
|   |   |-- merge-streamdown-props.ts
|   |   |-- streaming-context.ts
|   |   |-- markdown-status.ts
|   |   |-- copy-serializer.ts
|   |   `-- url-policy.ts
|   |-- renderers/
|   |   |-- create-renderers.tsx
|   |   |-- paragraph.tsx
|   |   |-- heading.tsx
|   |   |-- list.tsx
|   |   |-- task-list.tsx
|   |   |-- blockquote.tsx
|   |   |-- horizontal-rule.tsx
|   |   |-- inline-code.tsx
|   |   |-- rich-link.tsx
|   |   `-- image.tsx
|   |-- code/
|   |   |-- code-block.tsx
|   |   |-- code-toolbar.tsx
|   |   |-- code-placeholder.tsx
|   |   `-- language-label.ts
|   |-- table/
|   |   |-- markdown-table.tsx
|   |   |-- table-dialog.tsx
|   |   |-- table-actions.tsx
|   |   |-- column-analysis.ts
|   |   `-- table-copy.ts
|   |-- math/
|   |   |-- math-renderer.tsx
|   |   `-- math-plugin.ts
|   |-- mermaid/
|   |   |-- mermaid-block.tsx
|   |   |-- mermaid-dialog.tsx
|   |   |-- mermaid-plugin.ts
|   |   `-- mermaid-theme.ts
|   |-- extensions/
|   |   |-- file-reference.tsx
|   |   |-- citation.tsx
|   |   |-- media-grid.tsx
|   |   `-- visualization.tsx
|   |-- plugins/
|   |   |-- index.ts
|   |   |-- default-plugins.ts
|   |   `-- create-plugin-preset.ts
|   `-- styles/
|       |-- contract.css
|       |-- content.css
|       |-- code.css
|       |-- table.css
|       |-- math.css
|       |-- mermaid.css
|       |-- streaming.css
|       `-- index.css
|-- scripts/
|   |-- audit-public-source.mjs
|   |-- audit-package-files.mjs
|   |-- audit-licenses.mjs
|   `-- generate-third-party-notices.mjs
|-- provenance/
|   |-- css-modules.json
|   `-- third-party-components.json
`-- tests/
    |-- fixtures/
    |-- renderer/
    |-- streaming/
    |-- security/
    `-- css/
```

## 4. Public API and compatibility contract

The package supports three consumption levels.

### Level 1: styled preset

`StreamingMarkdown` is the recommended component. Its props extend `StreamdownProps` without
renaming or removing upstream options:

```tsx
import { StreamingMarkdown } from "streaming-markdown-kit";
import "streaming-markdown-kit/styles.css";

<StreamingMarkdown
  isAnimating={message.status === "streaming"}
  mode="streaming"
  components={{ a: AppLink }}
  controls={{ code: true, table: true, mermaid: true }}
>
  {message.content}
</StreamingMarkdown>
```

The type contract is additive:

```ts
import type { StreamdownProps } from "streamdown";

export interface StreamingMarkdownProps extends StreamdownProps {
  preset?: "full" | "base" | false;
  appearance?: "default" | "compact";
}
```

Consumer props always win over preset defaults. Objects such as `components`, `plugins`,
`controls`, `icons`, and `translations` are merged by key. Arrays such as `remarkPlugins`
and `rehypePlugins` follow an explicit replace-by-default rule, with
`createMarkdownPreset()` available when a consumer wants composition.

### Level 2: styles and plugin presets

Consumers may keep using the re-exported upstream component and opt into only this package's
styles or plugins:

```tsx
import { Streamdown } from "streaming-markdown-kit";
import { markdownPlugins } from "streaming-markdown-kit/plugins";
import "streaming-markdown-kit/styles.css";

<Streamdown className="smk-markdown" plugins={markdownPlugins}>
  {content}
</Streamdown>
```

The CSS targets package classes plus documented `data-streamdown` attributes. Basic
typography must work with raw Streamdown. Enhanced code, table, copy, expand, and Mermaid
layout requires `StreamingMarkdown`, because those features need package-owned semantic wrappers.

The published stylesheet is self-contained. Consumers must not need Tailwind, an `@source`
directive pointing into `node_modules`, or knowledge of Streamdown's internal utility
classes. During the package build, any required upstream layout primitives are compiled into
the distributed CSS; package-owned renderers and `data-streamdown` selectors remain the
long-term styling contract.

### Level 3: Streamdown-compatible exports

The package root uses `export * from "streamdown"`. Hooks, components, utilities, default
plugin collections, table conversion helpers, and public types remain importable from
`streaming-markdown-kit`. The package also exposes its pinned upstream version in release metadata and
tests its export surface against that version.

Package subpaths separate optional capabilities and CSS:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./plugins": "./dist/plugins/index.js",
    "./preset": "./dist/runtime/preset.js",
    "./styles.css": "./dist/styles/index.css",
    "./code": "./dist/code/index.js",
    "./code.css": "./dist/styles/code.css",
    "./math": "./dist/math/index.js",
    "./math.css": "./dist/styles/math.css",
    "./mermaid": "./dist/mermaid/index.js",
    "./mermaid.css": "./dist/styles/mermaid.css"
  }
}
```

The default `full` preset enables code highlighting, math, Mermaid, and CJK support. Heavy
implementations remain in split chunks and are loaded only when corresponding syntax is
encountered. The `base` preset excludes optional plugin dependencies. Plugin subpaths remain
available for consumers who want an explicit configuration.

“Preserve Streamdown APIs” means source compatibility for documented public exports and
props, not byte-for-byte identity with Streamdown's package layout. Any unavoidable conflict
is documented as a breaking change and requires a major version bump.

## 5. Snapshot-derived CSS reconstruction

The experiment combines package-authored component CSS with a generated parity layer. The
generator selects the captured Markdown CSS Module, rewrites its selectors to stable
`.smk-markdown-*` roles, replaces host variables with package tokens, and records source
metadata. Private selector hashes, proprietary variable names and the full source export
must not appear in the package tarball.

The reconstruction workflow is:

1. Locate the captured Markdown CSS Module using its token contract.
2. Rewrite captured module selectors onto package-owned semantic roles.
3. Normalize host variables into the `--smk-markdown-*` theme contract.
4. Keep custom React renderers and interaction code package-owned.
5. Record whether each CSS module is authored or generated in the provenance manifest.
6. Compare matched fixtures at the same viewport, font, scale, theme and content.

This workflow is appropriate for internal visual research. It does not establish permission
to redistribute the generated declarations. Publication requires a separate provenance and
licensing review, regardless of selector or variable rewriting.

## 6. CSS layers and theme contract

The package owns a deterministic cascade:

```css
@layer smk-markdown-contract;
@layer smk-markdown-base;
@layer smk-markdown-components;
@layer smk-markdown-extensions;
@layer smk-markdown-overrides;
```

`contract.css` defines neutral variables with usable fallbacks:

```css
.smk-markdown {
  --markdown-font-size: 13px;
  --markdown-line-height: 21px;
  --markdown-foreground: currentColor;
  --markdown-foreground-tertiary: color-mix(
    in srgb,
    currentColor 55%,
    transparent
  );
  --markdown-border-light: color-mix(in srgb, currentColor 12%, transparent);
  --markdown-border-heavy: color-mix(in srgb, currentColor 20%, transparent);
  --markdown-code-background: color-mix(in srgb, currentColor 6%, transparent);
  --markdown-content-max-width: 48rem;
  --markdown-wide-block-max-width: 64rem;
}
```

Consumers may map those variables onto their own theme without importing host-specific
tokens into the package:

```css
.product-message {
  --markdown-font-size: var(--product-message-font-size);
  --markdown-foreground: var(--product-text-primary);
  --markdown-foreground-tertiary: var(--product-text-tertiary);
  --markdown-border-light: var(--product-border-light);
  --markdown-border-heavy: var(--product-border-heavy);
  --markdown-code-background: var(--product-code-background);
}
```

The published package must not contain tokens, selectors, or layout rules belonging to any
particular host application.

## 7. Stable DOM contract

Pixel parity does not require copying the reference DOM. Renderer fixtures define a
package-owned semantic contract for class names, wrappers, direction attributes,
accessibility roles, and copy markers.

### Code block

```html
<div
  class="smk-markdown-code-block"
  data-markdown-copy="code-block"
  data-theme="light"
>
  <div class="smk-markdown-code-toolbar" data-markdown-copy="exclude">
    <div class="smk-markdown-code-language">TypeScript</div>
    <div class="smk-markdown-code-actions">
      <button aria-label="Enable wrapping"></button>
      <button aria-label="Copy"></button>
    </div>
  </div>
  <div class="smk-markdown-code-scroller" dir="ltr">
    <code></code>
  </div>
</div>
```

The wrapping button is shown only when wrapping is useful. Language labels are normalized
for display while the original fence language remains available to the highlighter and
copy serializer.

### Table

```html
<div
  class="smk-markdown-table-container smk-markdown-wide-table"
  data-markdown-table="true"
  tabindex="-1"
>
  <div class="smk-markdown-table-scroller">
    <div class="smk-markdown-table-wrapper">
      <table class="smk-markdown-table"></table>
    </div>
  </div>
  <div class="smk-markdown-table-actions" data-markdown-copy="exclude">
    <button aria-label="Expand table"></button>
    <button aria-label="Copy table"></button>
  </div>
</div>
```

The table renderer identifies numeric cells, single-child cells, alignment, estimated
column sizes, and file-reference cells. Wide tables use horizontal scrolling, edge fading,
and an expandable dialog.

### Mermaid

```html
<div
  class="smk-markdown-mermaid smk-markdown-wide-mermaid"
  data-wide-markdown-block="true"
  data-wide-markdown-block-kind="mermaid"
>
  <div class="smk-markdown-mermaid-surface">
    <div
      data-markdown-copy="code-block"
      data-markdown-copy-text="```mermaid ..."
    >
      <button aria-label="Expand Mermaid diagram"></button>
      <button aria-label="Copy"></button>
      <div
        data-mermaid-theme="base"
        data-mermaid-diagram="sequence"
        role="img"
      ></div>
    </div>
  </div>
</div>
```

The natural SVG width determines whether the expand control is visible. Generated Mermaid
instance CSS is not extracted from the static snapshot; Mermaid generates it at runtime
from the package-owned `base` theme configuration.

### Task list

Task items render a non-interactive, accessible checkbox control rather than a native
editable input:

```html
<button
  type="button"
  role="checkbox"
  aria-checked="true"
  data-state="checked"
  disabled
></button>
```

## 8. Streaming behavior

Streaming behavior is explicit and testable:

- `static`: parse and render once without streaming animation.
- `streaming`: repair incomplete Markdown and animate newly committed nodes.
- `complete`: freeze stable keys and stop scheduling animation.
- `error`: preserve the latest renderable content and expose error state to the host.

Rules:

1. An incomplete code fence displays a lightweight placeholder or code surface.
2. Mermaid does not execute until its closing fence arrives.
3. KaTeX does not execute until the expression boundary is complete.
4. Newly committed block nodes receive a stable delay and fade animation.
5. List markers animate with their list item.
6. Images use the reference scale-and-fade entrance.
7. `prefers-reduced-motion: reduce` disables all entrance animation immediately.
8. Existing nodes must not remount when a new stream chunk arrives.

Streamdown's default visual animation is disabled where it conflicts with the independently
implemented, measured node-level animation.

## 9. Copy protocol

Copying is serialized from the Markdown contract rather than relying on `innerText`:

```text
data-markdown-copy="code-block"
data-markdown-copy="inline-code"
data-markdown-copy="exclude"
data-markdown-copy-text="original Markdown"
```

The serializer:

1. Excludes toolbars, buttons, and decorations.
2. Prefers explicit `data-markdown-copy-text` content.
3. Restores fenced code blocks and their language.
4. Copies Mermaid as its source fence rather than SVG text.
5. Copies KaTeX as its original LaTeX.
6. Copies tables as Markdown or TSV according to the invoked command.
7. Preserves readable link text and URLs according to copy options.

## 10. Feature ownership

### Base package

- Headings, paragraphs, emphasis, deletion, and line breaks.
- Ordered, unordered, nested, and task lists.
- Blockquotes and horizontal rules.
- Links, images, and inline code.
- GFM tables.
- Streaming recovery, security, and copying.

### Code feature

- Lazy language loading and cached syntax highlighting.
- Language label, copy action, and wrapping action.
- Diff additions/deletions.
- Incomplete fence placeholder.

### Math feature

- Inline and display math.
- KaTeX HTML and MathML output.
- Official KaTeX CSS and font assets with license notices.

### Mermaid feature

- Flowchart, sequence, Gantt, and supported Mermaid diagram types.
- Base theme mapped to Markdown semantic variables.
- Copy, expand, download, and optional pan/zoom.
- Error and incomplete-fence states.

### Host extensions

- Rich-link favicon and domain presentation.
- File references.
- Citations and source navigation.
- Media grids.
- Application-specific visualizations.

These are injectable renderers because they require host data, routing, authorization, or
network policies.

## 11. Security

All Markdown is untrusted input. The package must:

- Sanitize raw HTML through an explicit allowlist.
- Reject or rewrite unsafe URL protocols.
- Add `noopener noreferrer` to external targets.
- Apply an explicit policy to images and data URLs.
- Keep Mermaid `securityLevel` strict.
- Avoid executing scriptable SVG or arbitrary embedded HTML.
- Bound expensive diagrams and input sizes.
- Provide application hooks for URL, image, and file authorization.

Security tests cover malicious links, raw HTML, SVG payloads, malformed KaTeX, Mermaid
directives, oversized input, and incomplete streaming constructs.

## 12. Tests and acceptance gates

Each visual fixture contains:

```text
fixture-name/
|-- source.md
|-- expected-dom.html
`-- expected.png
```

Required fixtures include:

- All six heading levels.
- Tight, loose, nested, and mixed lists.
- Read-only task lists and long task text.
- Blockquotes containing lists and code blocks.
- Aligned, numeric, nested, and oversized tables.
- Representative code languages and diff output.
- Incomplete inline styles and code fences.
- Inline and display mathematics.
- Mermaid flowchart, sequence, and Gantt diagrams.
- Links, images, file references, and citations.
- RTL, CJK, emoji, and long unbroken content.
- Reduced-motion and streaming modes.
- Malicious Markdown and URLs.

Automated architecture checks enforce:

- Every selector has an owning renderer or documented runtime source.
- Every renderer class has a CSS definition.
- No copied CSS Module hash or product-private token appears in public source.
- No ChatGPT/OpenAI branding, private selector, raw export, reference screenshot, font,
  icon, or SVG appears in the repository or package.
- Public fixtures contain original project-authored content only.
- CSS and third-party provenance records are complete.
- A no-Tailwind consumer renders correctly by importing only `streaming-markdown-kit/styles.css`.
- Every documented Streamdown public export remains importable from `streaming-markdown-kit`.
- Type checking, unit tests, package build, and consumer builds pass.

During private development, pixel acceptance may compare the package render against local
captures at matched content, font configuration, viewport, theme, and device scale. Only
package-generated baselines are committed to the public repository.

The strict-parity claim is gated, not subjective. It may be used only after:

- Every fixture has the same semantic content, wrapping, overflow, control visibility, and
  interaction state at the agreed viewport and theme.
- Typography is tested with the same available system fonts, weight, antialiasing context,
  device scale, and browser engine.
- Screenshot comparison passes the agreed per-pixel threshold and total differing-pixel
  budget; unavoidable platform rasterization differences are recorded separately.
- Streaming fixtures pass at multiple chunk boundaries, not only after completion.
- Code, table, math, Mermaid, task-list, link, image, copy, expand, RTL, CJK, and
  reduced-motion behavior all pass independently.

Until those gates pass, releases describe their coverage with a compatibility matrix and do
not claim complete 1:1 parity.

## 13. Migration plan

### Implementation status (2026-08-05)

- Phase 1 is complete for the standalone Vite consumer, package build, Streamdown API
  re-export, presets, styles, and dry-run tarball inspection. A clean-install tarball
  consumer remains to be automated.
- Phase 2 now has package-owned renderers for paragraphs, headings, ordered and unordered
  lists, list items, read-only task controls, blockquotes, horizontal rules, inline code,
  links, and images. The renderers expose stable `smk-markdown-*` classes and
  `data-markdown-*` attributes, and consumer overrides win by key.
- The base preset now applies a package-owned URL policy and secure external-link defaults.
  SSR renderer tests and URL-policy tests cover the implemented contract.
- Package-owned code blocks now provide language labels, copy state, wrapping, incomplete
  state, and fenced-source serialization while retaining the official Shiki highlighter.
- Package-owned tables now provide semantic cells, numeric analysis, wide scrolling,
  Markdown/TSV serialization, copy actions, and an expandable dialog.
- Provenance and source/package/license audits are automated. Interaction tests and visual
  acceptance gates remain open.
- Math now includes a package renderer, official KaTeX CSS/fonts, and licensed asset
  packaging. Mermaid has a strict package-owned shell, deferred execution, copy/download,
  error/retry, and fullscreen behavior. Shiki and Mermaid runtimes load on demand.
- File reference, citation, media grid, and visualization custom-tag contracts are
  implemented with host renderer overrides.
- The standalone Vite preview and an isolated offline tarball SSR consumer pass. The Vite
  preview is the sole maintained example application. Visual acceptance and a broader
  interaction/security matrix remain open.
- A local PostCSS research tool now discovers the captured Markdown CSS Module as a whole,
  removes build hashes in ignored local output, and reports declaration-level differences
  against package-owned styles. It currently extracts 86 rules and 171 unique declarations;
  raw captured CSS and generated comparison files remain outside the publish tarball.
- The first batch reconciliation aligns list markers, block task items, blockquote cleanup,
  table centering and numeric sizing, code placeholders, rich links, and Mermaid overlay
  controls. Source-level visual-contract tests lock the measured geometry.

### Phase 1: package foundation

1. Create `packages/markdown` and its build/export configuration.
2. Add Streamdown and pin its exact version.
3. Re-export the complete Streamdown public surface and add an export compatibility test.
4. Define `StreamingMarkdown`, `StaticMarkdown`, preset merging, and plugin subpaths.
5. Add the neutral theme contract and a minimal consumer test.
6. Add a standalone build, tarball inspection, and clean-install consumer test.

Exit condition: a static and streaming paragraph render through `streaming-markdown-kit` in
a clean React consumer with no monorepo or host-application dependency.

### Phase 2: semantic renderer foundation

1. Implement package-owned renderers for every base Markdown node.
2. Establish stable classes and `data-*` contracts without relying on upstream utilities.
3. Implement code-block, copy, and task-list behavior behind the package API.
4. Add original fixtures covering every supported node and nesting combination.

Exit condition: the package renders its complete base feature matrix without importing code,
styles, tokens, components, or assets from a host application.

### Phase 3: clean-room visual reconstruction

1. Record observable metrics and states in a neutral visual contract.
2. Implement package-owned content, code, table, Mermaid, and streaming CSS.
3. Record authorship and third-party provenance for each style module.
4. Add source scans for private selectors, assets, branding, and raw exports.
5. Compare the result privately and adjust the package-owned tokens and rules.

Local comparison is generated with:

```sh
pnpm --filter streaming-markdown-kit research:css -- /absolute/path/to/styles.css
```

The ignored `.local-reference/` output is research material only and must not be committed
or included in a package tarball.

Exit condition: all Markdown styles are independently authored, traceable to a semantic
component, and pass both visual acceptance and provenance checks.

### Phase 4: exact DOM renderers

1. Match headings, lists, task controls, blockquotes, and horizontal rules.
2. Implement the code-block toolbar and copy protocol.
3. Implement enhanced table analysis, actions, wide layout, and dialog.
4. Implement Rich Link as an injectable renderer.

Exit condition: semantic DOM fixtures pass and private static pixel comparisons meet the
agreed tolerances.

### Phase 5: heavy plugins

1. Integrate code highlighting through `@streamdown/code`.
2. Integrate KaTeX through `@streamdown/math` and official assets.
3. Integrate dynamically loaded Mermaid through `@streamdown/mermaid`.
4. Match the reference Mermaid base theme and natural-width behavior.

Exit condition: code, math, and Mermaid fixtures pass in static and streaming modes without
entering the base bundle unnecessarily.

### Phase 6: extension API and standalone consumers

1. Add file-reference, citation, media, and visualization slots.
2. Add documented theme, navigation, URL, image, and dialog adapters.
3. Create a clean React/Vite example consumer outside the package source.
4. Verify raw Streamdown, styled preset, base preset, and full preset consumption.
5. Run browser and SSR/hydration verification.

Exit condition: `streaming-markdown-kit` installs from its tarball and works independently
in each documented consumer without monorepo aliases or unpublished files.

### Phase 7: release hardening

1. Add package documentation and a feature compatibility matrix.
2. Generate license notices for Streamdown, KaTeX, Mermaid, and code-highlighting assets.
3. Add a public-repository leak scan and an explicit package-file allowlist.
4. Verify dependency licenses, attribution requirements, and package SPDX metadata.
5. Add semantic versioning and release automation.

Exit condition: the package tarball is independently consumable, contains only intended
files, and passes license, size, security, and consumer-build checks.

## 14. Fork policy

Start with a pinned official Streamdown release behind the package compatibility surface.
Fork only when an exact behavior cannot be implemented through public hooks, specifically:

- Incomplete fence or delimiter recovery differs materially.
- AST node identity causes animation remounts.
- Tables rebuild excessively while streaming.
- Copy serialization cannot access the required source form.
- Sanitization prevents an approved reference node.
- Renderer APIs do not expose required AST metadata.

A fork must preserve the tested Streamdown public surface. No package-owned API may expose
fork-specific types, and the package must continue re-exporting the compatible public API.

## 15. Public release and provenance

This project has one release target: a public GitHub repository and public package. The raw
ChatGPT stylesheet, HTML, source maps, CSS Module hashes, fonts, logos, icons, SVGs,
screenshots, and other private client assets are prohibited from both the repository and
the package tarball unless a separate, explicit license is documented.

The package and repository branding must remain independent:

- Use `streaming-markdown-kit`, `smk-markdown-*`, and project-owned demo content.
- Do not use ChatGPT or OpenAI names in the package name, exported API, CSS namespace,
  logo, screenshots, or metadata in a way that implies affiliation or endorsement.
- The README may factually describe the project as an independent implementation inspired
  by observable interaction patterns and must include a clear non-affiliation statement.

Required repository files and records:

- A project `LICENSE` and correct SPDX license metadata in every published package.
- `THIRD_PARTY_NOTICES.md` covering Streamdown, KaTeX, Mermaid, syntax highlighting,
  icons, fonts, and any redistributed assets.
- `provenance/css-modules.json` recording independent authorship for each CSS module.
- `provenance/third-party-components.json` recording source URL, version, license, and
  whether code or assets are redistributed.

Required release gates:

1. Run `npm pack --dry-run` and enforce an allowlist for tarball contents.
2. Scan tracked files, Git history, build output, and package output for known raw-export
   paths, private hashes, product tokens, unexpected branding in runtime/package metadata,
   and unapproved binary assets.
3. Run a dependency-license audit and manually verify every redistributed asset license;
   do not infer a license solely from the existence of a public repository.
4. Generate and review an SBOM and third-party notices.
5. Obtain appropriate legal review before release if exact visual similarity, trademark
   wording, or asset provenance remains uncertain.

OpenAI's terms distinguish user-generated model output from the service and its own
intellectual property. Ownership of generated output must not be treated as permission to
redistribute client CSS, markup, or assets.

## 16. Definition of done

The migration is complete when:

- `streaming-markdown-kit` installs and runs as a standalone public package.
- Streamdown's documented public API and props are available through `streaming-markdown-kit`.
- Raw Streamdown, styled preset, and plugin-preset consumption modes all pass consumer tests.
- Every implemented Markdown behavior has a semantic owner.
- DOM and CSS are independently authored from a neutral visual contract.
- Code, tables, task lists, KaTeX, Mermaid, rich links, copying, and streaming states work.
- The package contains no host-application-private contract.
- Static and streaming DOM/security tests pass.
- Private visual comparisons pass at agreed viewports and themes.
- Standalone Vite and isolated tarball SSR consumer builds pass.
- The Git repository and publish tarball contain no raw reference exports or private assets.
- License, attribution, provenance, trademark, and package-content gates pass.

## 17. References

- Streamdown repository: <https://github.com/vercel/streamdown>
- Streamdown plugins: <https://streamdown.ai/docs/plugins>
- Streamdown Mermaid plugin: <https://streamdown.ai/docs/plugins/mermaid>
- OpenAI Terms of Use: <https://openai.com/policies/terms-of-use/>
- KaTeX repository and license: <https://github.com/KaTeX/KaTeX>
- Mermaid license: <https://github.com/mermaid-js/mermaid/blob/develop/LICENSE>
- Local reconstruction architecture: `docs/static-workspace-rebuild.md`
- Frontend architecture plan: `docs/frontend-architecture-optimization-plan.md`
