# Roadmap

## Phase 0 — Bootstrap
WXT + Vue + TS + pnpm + Tailwind + ESLint + Prettier + tests + CI. Verify Chromium dev loading.

## Phase 1 — Vertical slice (MVP)
Sidepanel, active-tab injection, picker overlay, click/Escape, computed text/background/border color, conversion, copy, error states.

## Phase 2 — Quality
Integration/E2E fixture coverage; permission audit; accessibility; lifecycle and tab navigation QA; README screenshots; package ZIP.

## Backlog

### UX: Deepen sidepanel workflow

- Status: Backlog — [GH #1](https://github.com/mudmykola/korpiox-inspect/issues/1)
- Priority: Medium
- Scope: Sidepanel UX and accessibility
- Goal: Review the complete inspection workflow with a user's perspective and make the next interaction obvious at every state.

Acceptance criteria:

- Ready, picking, selected, error and empty states have one clear primary action.
- Element inspection and pixel sampling are visually distinct but consistent.
- Result hierarchy is understandable without opening developer details.
- Copy, history, restore, export and clear actions have clear feedback and accessible labels.
- Narrow sidepanel layout is checked at realistic widths and long selectors/attributes do not break the layout.
- Keyboard focus, Escape cancellation and error recovery are manually verified in Chromium.
- The final UX decisions are documented with screenshots or a short decision note.

## Phase 3 — Color workflows
Pixel picker (supported browsers), local color history, palettes, CSS variable hints, contrast checker.

## Phase 4 — Browser expansion
Firefox sidebar/browser API adapters and compatibility testing. Avoid promising parity where APIs differ.

## Phase 5 — Public release
Privacy policy if required by stores, icons/screenshots, versioning, review, Chrome Web Store / AMO publishing only after explicit authorization.
