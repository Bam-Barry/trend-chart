# Trend chart

A standalone demo of the trend chart from Nuvora's Overview: two series (this
period against the one before) as smooth areas. On hover the chart drains to
grey and only the segment around the cursor keeps its colour — line and tint —
with an ink tooltip and a date pill. A DialKit panel (top-right) tunes it live.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + static build into dist/
npm run preview   # serve dist/ locally
```

## Deploy

It's a static site — `dist/` after `npm run build`.

- **Vercel / Netlify / Cloudflare Pages:** import the repo; build command
  `npm run build`, output directory `dist`. No config needed.
- **Anywhere else:** upload the contents of `dist/`.

## What's in it

| Path | What |
| --- | --- |
| `src/App.tsx` | The page: the chart, its demo series, and the DialKit panel |
| `src/chart/` | The chart kit — `@bklit/line-chart`, `area-chart` and `y-axis` from the shadcn registry, converted from Tailwind to one CSS Module (`bklit.module.css`) |
| `src/styles/tokens.css` | Design tokens; the `--chart-*` variables the kit reads are set here |
| `src/styles/fonts.css`, `src/fonts/` | TWK Lausanne |

### Local edits to the kit

Marked "Local edit" in the source:

- `labelFormat` on `LineChart` / `AreaChart` — formats the hover pill (used for hours).
- Series skip points with no value, so a line can end early.
- `Area`: `decolorOnHover` and `dimOpacity` — grey the series on hover and redraw
  only the hovered band in colour.
- `SeriesHoverDim`: `desaturate` — the grayscale, driven by CSS.
- `baseline.tsx` — the solid baseline with a dot under each point (not from the registry).
- React 18 ref casts in `line.tsx`.

### Panel controls

Range (this week / today), points, swing · line colours, width, curve · hover
decolour, tint, dim · grid, baseline, edge fade · loading · replay reveal.

## Note on the font

TWK Lausanne is a commercial typeface. Hosting this publicly serves the font
files — make sure your licence covers web use, or swap `--font-sans` in
`tokens.css` for a free face.
