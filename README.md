# KORPIOX Inspect

> A privacy-first Chromium extension for inspecting webpage colors and element metadata from a focused sidepanel.

KORPIOX Inspect helps frontend developers, Shopify theme developers, QA engineers and designers answer a practical question quickly: **what styles and identifying attributes does this element actually have?**

Select an element on the active page and inspect its computed text, background and border colors, WCAG contrast, tag, ID, classes, `data-*`, `aria-*` and selected attributes. You can also sample an exact screen pixel with the browser EyeDropper API.

## Why this project

Full DevTools is powerful, but it is often more than is needed for a quick visual or accessibility check. KORPIOX Inspect keeps the workflow focused:

1. Open the sidepanel.
2. Pick an element or a screen pixel.
3. Read the result and copy the value or JSON.

The extension is intentionally local-first. Page data is processed in the browser and is not sent to a remote service.

## Features

- Element picker with hover highlight, click selection, Stop and Escape cancellation.
- Computed text, background and border colors with raw CSS value preservation.
- HEX and RGB conversion where the color is solid and representable.
- Border color inspection for all four sides.
- WCAG text/background contrast ratio and level.
- Developer details: tag, ID, classes, `data-*`, `aria-*` and selected attributes.
- Exact pixel sampling through the native EyeDropper API when supported.
- Copy HEX, RGB, details JSON or the complete inspection result.
- Local inspection history with restore, export and clear actions.
- Ukrainian user interface and Ukrainian in-page picker labels.
- Branded Chrome extension icons and a compact sidepanel layout.

## Product status

Current release: `0.1.0` — Chromium MVP.

Implemented and locally verified:

- sidepanel and runtime content-script injection;
- typed inspection DTOs and message contracts;
- DOM picker lifecycle and cleanup;
- color normalization and contrast calculations;
- local history and export;
- Ukrainian localization;
- KORPIOX branding;
- TypeScript, ESLint, Vitest and production build gates.

The project is not published to the Chrome Web Store. Browser-store review, packaging, screenshots and production distribution are intentionally outside the current milestone.

## Technical architecture

```text
Sidepanel (Vue)
  ├─ user actions and result presentation
  ├─ local Pinia state
  └─ clipboard, history and permission flow
          │ typed runtime messages
          ▼
Content script
  ├─ hover overlay and selection lifecycle
  ├─ DOM metadata extraction
  └─ computed style inspection
          │ serializable DTO
          ▼
Shared core
  ├─ color normalization with Culori
  ├─ WCAG contrast calculation
  └─ message and inspection contracts
```

Runtime boundaries are deliberate:

- `entrypoints/` owns browser bootstrapping only.
- `src/features/` owns cohesive feature behavior and DOM controllers.
- `src/shared/color/` contains pure color logic.
- `src/shared/messaging/` contains serializable contracts.
- `src/stores/` contains sidepanel-local Pinia state; contexts do not share a store.
- Content scripts never pass DOM nodes to the sidepanel.

## Stack

- WXT 0.21
- Vue 3 + Composition API
- TypeScript strict mode
- Tailwind CSS v4 and project CSS tokens
- Pinia
- Culori
- Lucide Vue Next
- Vitest + Vue Test Utils + jsdom
- Playwright for Chromium extension E2E
- pnpm

There is no large component framework in the current implementation. The sidepanel uses a small, project-owned UI layer built with Vue, Tailwind and CSS. This keeps the extension lightweight and gives the narrow browser sidepanel precise visual and accessibility control.

## Getting started

Requirements:

- Node.js with Corepack or pnpm;
- pnpm 10.26 or compatible;
- Chromium-based browser for manual extension testing.

Install dependencies:

```bash
pnpm install
```

Run the development build:

```bash
pnpm dev
```

For a production unpacked build:

```bash
pnpm build
```

Then open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select:

```text
.output/chrome-mv3
```

After source changes, rebuild and press **Reload** on the extension before reopening the sidepanel.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Current local result:

- 9 unit/integration tests passing;
- TypeScript check passing;
- ESLint passing;
- Chromium production build passing.

The Playwright extension test is configured, but headless Chromium currently requires a macOS permission adjustment in this environment. That limitation is reported separately rather than treated as a passing browser proof.

## Permissions and privacy

KORPIOX Inspect follows a least-privilege approach for a user-triggered MVP:

- `activeTab` and `scripting` support on-demand inspection;
- `tabs` is used to identify the active tab URL for the permission flow;
- optional host access is requested only for the active HTTP(S) origin after the user starts picking;
- `sidePanel` provides the browser sidepanel;
- `clipboardWrite` supports user-triggered copy actions.

The extension does not use analytics, tracking, remote telemetry, page scraping, remote executable code, screenshots, screen recording or network upload of inspected data.

## Known limitations

- Browser-internal pages and restricted URLs cannot be inspected.
- Cross-origin iframe contents are limited by browser isolation.
- Closed Shadow DOM is not traversed.
- `getComputedStyle()` reports computed CSS, not necessarily the winning stylesheet declaration.
- Mapping a computed value back to its originating CSS variable or rule is not yet implemented.
- The native EyeDropper API is browser-dependent; the element picker remains the fallback.
- Firefox support is planned separately and is not claimed by the Chromium MVP.

## Roadmap

- CSS variable and declaration-source hints.
- Better contrast workflow and selectable foreground/background pairs.
- Stable browser E2E coverage with fixture navigation and permissions.
- Firefox sidebar compatibility.
- Release ZIP, store screenshots and publication documentation.

See the detailed planning documents in [`docs/`](docs/), especially [`docs/PRD.md`](docs/PRD.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SECURITY.md`](docs/SECURITY.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Project conventions

- Conventional Commits.
- No automatic commit, push or deployment from the development workflow.
- Comments, filenames and technical documentation are written in English; product UI is localized independently.
- Every feature should preserve cleanup, typed boundaries, accessibility and truthful validation evidence.

## License

No public license has been selected yet. This repository should be treated as an all-rights-reserved project until a license is added.
