# Test Strategy

## Unit — Vitest

Color normalization: #RGB, #RRGGBB, alpha, rgb/rgba, hsl, oklch, transparent, invalid input. Test conversion and preserving raw value.
Contrast: WCAG ratio, AAA/AA/AA Large/Fail thresholds, transparent or unavailable colors.

## Integration

Picker state machine, overlay creation/removal, pointermove/click/Escape, repeated start, cancel, selected element, border-side DTOs, element metadata, missing DOM and error handling. Use the jsdom lifecycle test for listeners and serializable payloads; do not pretend jsdom renders computed pixels.

## E2E — Playwright

Launch a Chromium persistent context with unpacked extension per Playwright guidance. Use real extension pages and a local fixture server. Confirm sidepanel opening strategy supported by test browser, picker activation, selection, color display and copy. If sidepanel automation is unsupported, document manual QA rather than faking E2E coverage.

## Fixtures

Include: solid background, transparent parent, nested colors, border, CSS variables, gradient, SVG, open Shadow DOM, iframe, text with alpha. Cross-origin iframe is a documented limitation.

The current fixture is `tests/fixtures/colors.html` and is intended for local Chromium verification. Manual Chromium QA must also cover Pixel picker success, Escape cancellation, history persistence, export, and unsupported-browser fallback.

## CI

Lint, typecheck, unit tests and production build on PRs. E2E in CI only when stable and configured; otherwise make it an explicit follow-up.
