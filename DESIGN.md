# Stillwave Studio Design Direction

## Design Read
Reading this as: interactive studio portfolio and Android app catalog for puzzle players and privacy-conscious Android users, in a sculpted midnight-and-ivory showcase language, dial ENERGY 3 / RHYTHM 3 / MOTION 3.

## Identity & Dials
- **Studio:** Stillwave Studio
- **Voice:** Calm, direct, craft-focused, transparent about offline and Google Play availability.
- **Dials:** `ENERGY 3` (bold interactive studio presence) / `RHYTHM 3` (asymmetric hero, tabbed spotlight stage, mixed-hierarchy catalog with wide flagship cards, two-column editorial ethos) / `MOTION 3` (cursor-reactive and scroll-reactive Three.js wave sculpture, 3D card perspective, pauseable spotlight, with full pause control and reduced-motion halt).

## Core Palette (R-01, R-21, R-29, R-34)
1. **Midnight Navy (`#050b1a` / `#0c152c`):** Primary dark canvas matching Stillwave Studio's sculpted wave banner (`banner.webp`).
2. **Sculpted Warm Ivory (`#f5efe3` / `#fffcf6`):** Primary foreground in Midnight mode and primary canvas in the Ivory light theme.
3. **Brushed Gold (`#e5c378` dark / `#73520e` light):** Single deliberate studio accent derived from the gold-rimmed wave medallion (`studio-mark.png`).

## Typography (R-06)
- **Display Serif (`Cormorant Garamond`):** Connects headlines and editorial pull-quotes to the classic serif wordmark in Stillwave Studio's brand banner.
- **UI & Body Sans (`Plus Jakarta Sans`):** High x-height geometric humanist sans for legible app descriptions, filter controls, and mobile labels at small sizes.

## Written One-Line Decisions (R-31 & Purpose-Gate Reasons)
- **Palette (R-01, R-29):** Restricted to navy, warm ivory, and brushed gold so all 12 diverse app icons sit inside one unified studio frame instead of competing rainbow accents.
- **Top Horizon Gradient (R-01):** A single top-only gradient separates the interactive hero stage from the solid catalog ground plane below it.
- **Theme Toggle (R-21, R-34):** Midnight is the default to match the studio's dark-navy emblem artwork, paired with a working Ivory light theme toggle for bright environments.
- **Section Rhythm (R-05):** Each section changes structure: split hero, single-item tabbed stage, filterable catalog with wide flagship cards, and a two-column editorial ethos list.
- **Border Radius Scale (R-11):** Four distinct radii (`24px` stage frames, `18px` cards, `12px` controls/tags/inputs, `999px` pills reserved solely for primary browse and Google Play CTAs) separate primary actions from secondary chrome.
- **Glassmorphism Cap (R-10):** `backdrop-filter: blur` is capped strictly at two sticky bars (`.nav-bar` and `.catalog-toolbar`) so scrolling content remains legible behind floating navigation while cards stay solid.
- **Elevation Shadow Cap (R-12):** Drop shadows are reserved for the two sticky bars, mobile drawer, and hovered/spotlight focal surfaces so elevation marks real z-index layering.
- **Glow Cap (R-13):** Soft accent glow is used only behind the active spotlight icon pedestal to anchor the single focal app in the featured stage.
- **Card Hierarchy Variation (R-14):** Flagship titles (`Hoppa`, `Blockwarden`, `QuitUrge`) span wider two-column featured layouts in grid mode so major releases stand apart from compact puzzle and utility entries.
- **Functional Status Badges (R-09):** Capsule status tags appear only to distinguish unreleased `"Coming soon to Google Play"` titles from live store links, without decorative dots or pulses.
- **Motion & Pause Control (R-19, R-39):** Three.js wave ripples respond to cursor and scroll input to embody the "Stillwave" name, while a header `Pause Motion` toggle and `prefers-reduced-motion` support stop all continuous WebGL and spotlight motion on demand.
