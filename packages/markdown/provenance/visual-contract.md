# Markdown visual contract

This document records normalized visual targets for the experimental package. Measurements
are expressed through package-owned tokens and semantic states. The handwritten component
styles use this contract, while the generated parity layer is separately derived from a
user-supplied static stylesheet and recorded in `css-modules.json`.

## Content

| Property | Default target | Compact target |
| --- | ---: | ---: |
| Body font size | 13px | 13px |
| Body line height | 21px | 20px |
| Paragraph gap | 11px | 8px |
| Content width | 640px | 640px |
| Inline code radius | 6px | 5px |
| Inline code horizontal padding | 6px | 5px |

Headings use the body font family, weight 600, and zero letter spacing. H1 through H6 use
24, 20, 17, 17, 15, and 15px respectively. Lists reserve 21px for their marker column.
Nested unordered lists progress from disc to circle to square. Blockquotes use a 4px rule
with a 2px radius and 24px content inset. Links use a 16px site icon, 3px icon gap, 2px
inline inset, medium weight, and a 0.5px dashed underline only on hover. Read-only task
controls are 14px inline checkboxes, offset 2px below the baseline with a 6px trailing gap.

## Code

Code blocks occupy the available content width, use a 10px outer radius with no visible
border, and a 28px toolbar. Toolbar actions have a fixed 26px square hit target and 8px
radius. Code uses the host system monospace stack at 13px with a 20px line height.
Horizontal scrolling never changes the outer block width.

## Tables

Tables may extend 24px beyond the prose column on each side. Header cells use weight 600
and a 16px line height. Body rows use 10px vertical padding and subtle separators. The last
row reserves 24px below its content. Wide tables scroll horizontally while actions remain
reachable as a vertical overlay at the table's trailing edge.

## Math and diagrams

Display math scrolls horizontally without changing prose width or adding a second outer
margin around KaTeX. Diagram surfaces have a 10px outer radius, 1px border, a minimum
rendered height of 160px, and controls overlaid 8px from the top-right corner. Generated SVG
content must remain inspectable without clipping labels.

## Motion

New streaming content fades from transparent to opaque over 140ms with an ease-out curve.
Word staggering is 12ms. Previously committed content does not animate again. Reduced
motion removes entrance animation and delay immediately.

## Themes and acceptance

Color is expressed only through semantic variables in `contract.css`. Light and dark hosts
must supply equivalent text, secondary text, surface, raised surface, border, subtle border,
and link roles. Visual fixtures are accepted only at matched viewport, font availability,
device scale, theme, and content. Platform font rasterization is reported separately from
layout or color differences.
