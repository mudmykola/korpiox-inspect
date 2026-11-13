# Product Requirements Document

## Product
KORPIOX Inspect — інспектор кольорів: privacy-first browser extension for frontend developers and designers to select webpage elements and inspect their colors, IDs, classes, attributes and WCAG contrast without navigating full DevTools.

## Audience
Frontend engineers, Shopify theme developers, QA engineers and designers.

## MVP scope (Chrome/Chromium and Firefox)
1. Open the extension side panel in Chrome/Chromium or sidebar in Firefox.
2. Click **Pick Element** to enter selection mode.
3. Highlight hovered DOM element with non-interfering overlay.
4. Click to select; Escape to cancel; explicit Stop button.
5. Show element tag and a best-effort identifying selector.
6. Show computed text, background and border colors.
7. Show HEX and RGB where conversion is meaningful; preserve raw CSS value.
8. Copy a chosen value to clipboard.
9. Handle unsupported/restricted pages, permission errors and stale tabs gracefully.
10. No account, backend, analytics or external requests.
11. The native EyeDropper API is used when available; Firefox uses a local visible-viewport screenshot picker and the DOM picker remains the fallback.

## Out of scope for MVP
Pixel sampling from user-provided screenshots/images/canvas; complete CSS cascade/source tracing; cross-origin iframe inspection; global site-wide palette extraction; cloud sync; AI features.

## Acceptance criteria
- User-triggered picker works on ordinary HTTPS sites without blanket host permissions.
- No duplicate overlay/listeners after repeated activation.
- Selection and Escape always clean up overlay/listeners.
- Sidepanel renders a serializable result with computed colors.
- Transparent and non-solid colors are not misrepresented as an opaque visible pixel color.
- No external telemetry or page-content transmission.
- Tests and production build run successfully.

## Later milestones
Pixel EyeDropper with browser support detection; history and export; CSS variables/source inspection; WCAG contrast; cross-browser regression coverage.
