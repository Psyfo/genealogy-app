# Ndebele Modernism — design system (shelved)

A bold, geometric design language drawn from Ndebele mural art and beadwork.
This branch (`design/ndebele-modernism`, tag `ndebele-modernism-v1`) preserves the
full working implementation. This document is the portable spec for reusing it
elsewhere (e.g. a culture web app). The reference implementation lives in
`src/app/globals.css` and `src/components/{ui,layout}`.

## Philosophy

A warm bone ground, saturated primaries, and the signature **black keyline**
that outlines every form. Hard edges, confident colour blocks, generous
structure. A modern interpretation, not a costume — restraint carrying a bold,
joyful palette. Depth comes from **hard offset shadows** (cut-paper), not blur.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| ink | `#15110d` | text, keylines, borders (the outline) |
| ink-soft | `#4a4035` | secondary text |
| bone | `#f5efe2` | page background |
| paper | `#fffdf8` | surfaces / cards |
| sand | `#ece3d1` | muted fills |
| hairline | `#ddd1ba` | subtle dividers |
| cobalt | `#1f44c2` | primary / links (royal blue) |
| cobalt-deep | `#16329a` | primary hover |
| marigold | `#f3b324` | accent / highlights (ink text on it) |
| vermilion | `#df3b2c` | danger / accent red |
| emerald | `#1b8f5d` | success / "living" |
| magenta | `#c3338a` | accent / marriage edges |
| sky | `#6fb1da` | soft accent |

Accessibility: ink-on-bone and white-on-cobalt/vermilion/emerald pass AA.
Marigold is light — only use it as a background with ink text, never as small
coloured text.

## Type

- **Display / headings:** Bricolage Grotesque (600/700/800), tight tracking (-0.02em).
- **Body / UI:** Inter.
- **Mono (dates, ids):** JetBrains Mono, tabular-nums.

## Geometry & depth

- Hard-edged: small radii (`~3px`), 2px ink "keyline" borders on cards/inputs.
- Offset block shadows: `box-shadow: Npx Npx 0 0 ink` (sm 2px / base 4px / lg 6px).
- Button press: shadow grows + element nudges up on hover, collapses on active.

## Signature motif — the triangular frieze

A seamless Ndebele triangle band: saturated peaks on a bone ground, each
outlined with the keyline. Implemented as a tiling SVG `<pattern>` (no viewBox,
`width="100%"`, rect filled with the pattern) so it repeats crisply at any width.
Colour cycle `[cobalt, marigold, vermilion, emerald, magenta]`; tile width =
`triangleBase × colours.length`; each triangle is a polygon
`i*base,h  i*base+base/2,0  i*base+base,h` with a 1.5px ink stroke. See
`src/components/layout/ndebele-band.tsx`. The `BrandMark` is a keyline diamond
quartered into four of the colours.

## Component recipes

- **Card:** `border-2 border-ink bg-paper rounded-sm shadow-block-sm`, often a
  thin coloured top bar; hover nudges up to `shadow-block`.
- **Button (primary):** `bg-cobalt text-bone keyline` + the press motion above.
- **Input:** `border-2 border-ink bg-paper rounded-sm`; focus shows a block shadow.
- **Avatar:** keyline square, ground = a palette colour hashed from a seed.
- **Dialog:** ink/45 overlay + `bg-bone border-2 border-ink shadow-block-lg`.

## To reuse

Lift `src/app/globals.css` (the `@theme` tokens, `@utility` block shadows,
keyframes) plus `src/components/ui` and `src/components/layout` into the target
project. Fonts are wired via `next/font` in `src/app/layout.tsx`.
