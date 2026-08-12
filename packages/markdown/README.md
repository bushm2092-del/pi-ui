# streaming-markdown-kit

Experimental Streaming Markdown presets and snapshot-derived Codex-style UI built on Streamdown.

> This package is a visual-replication experiment intended for local research and internal
> use. Its parity layer is generated from a user-supplied static stylesheet; it is not a
> clean-room reimplementation and should not be published without a separate provenance and
> licensing review.

```tsx
import { StreamingMarkdown } from "streaming-markdown-kit";
import "streaming-markdown-kit/styles.css";

<StreamingMarkdown isAnimating={isStreaming}>{content}</StreamingMarkdown>;
```

The package root re-exports Streamdown's public API. Use `StreamingMarkdown` for the complete
styled preset, `StaticMarkdown` for completed content, or import `Streamdown` from this
package when you need the unwrapped upstream component.

Official plugin instances and factories are available from `streaming-markdown-kit/plugins`.

Package-owned base renderers are enabled by the `base` and `full` presets. They can also be
composed directly:

```tsx
import { createMarkdownRenderers } from "streaming-markdown-kit/renderers";

<StreamingMarkdown
  components={createMarkdownRenderers({ a: ApplicationLink })}
  preset="base"
>
  {content}
</StreamingMarkdown>;
```

Consumer component overrides are merged by key and always win over preset defaults. The
default URL policy accepts HTTP(S), mail, telephone, anchor, and relative URLs, while
rejecting scriptable protocols. Absolute HTTP(S) links open in a new tab with
`noopener noreferrer` unless the consumer overrides those attributes.

Optional feature entrypoints are available at `/code`, `/table`, `/math`, `/mermaid`, and
`/extensions`. The default code and Mermaid plugins defer their heavy runtimes until a
matching fenced block is rendered. Official KaTeX CSS and fonts ship with `styles.css`.

Host-backed content uses explicit safe custom tags:

```md
<smk-file path="src/app.tsx" line="42">app.tsx</smk-file>
<smk-citation source="7">7</smk-citation>
<smk-media-grid>...</smk-media-grid>
<smk-visualization kind="timeline">...</smk-visualization>
```

Applications can replace each renderer through the `extensions` prop without changing the
Markdown parser or package CSS contract.

## Refreshing the parity layer

From the workspace root, regenerate the snapshot-derived layer with:

```sh
pnpm --filter streaming-markdown-kit research:css -- \
  /absolute/path/to/static-export/styles.css --write-package
```

The command writes the transformed CSS to `src/styles/generated/product-parity.css` and a
normalized comparison report to the ignored `.local-reference/` directory. The report's
`handwrittenBaselineMissingCount` describes how much of the snapshot is supplied by the
generated layer; it is not an error count.

## Visual parity check

With the Vite example running on port 4174, capture the reference, candidate and amplified
pixel diff with:

```sh
pnpm --filter streaming-markdown-kit-vite-example visual:parity
```

Artifacts and `report.json` are written to the ignored workspace directory
`.visual-parity/`. The initial fixture is fixed to a 990×1400 light-theme viewport at 1×
device scale. Set `SMK_PREVIEW_URL` or `SMK_CHROME_PATH` to override the defaults.

This project is not affiliated with or endorsed by OpenAI. The package tarball excludes the
source static export, but the generated parity stylesheet contains transformed declarations
derived from that local input.
