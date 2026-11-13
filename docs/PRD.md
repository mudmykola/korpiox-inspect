# Product Requirements Document

## Product
KORPIOX Inspect — інспектор кольорів: privacy-first browser extension for frontend developers and designers to select webpage elements and inspect their colors, IDs, classes, attributes and WCAG contrast without navigating full DevTools.

## Audience
Frontend engineers, Shopify theme developers, QA engineers and designers.

## MVP scope (Chrome/Chromium)
1. Open extension sidepanel.
2. Click **Pick Element** to enter selection mode.
3. Highlight hovered DOM element with non-interfering overlay.
4. Click to select; Escape to cancel; explicit Stop button.
5. Show element tag and a best-effort identifying selector.
6. Show computed text, background and border colors.
7. Show HEX and RGB where conversion is meaningful; preserve raw CSS value.
8. Copy a chosen value to clipboard.
9. Handle unsupported/restricted pages, permission errors and stale tabs gracefully.
10. No account, backend, analytics or external requests.
11. Chromium Pixel picker uses the native EyeDropper API when available and falls back to the DOM picker when unavailable.

## Out of scope for MVP
Pixel sampling from screenshots/images/canvas; complete CSS cascade/source tracing; cross-origin iframe inspection; global site-wide palette extraction; cloud sync; AI features; Firefox sidebar support.
Pixel picker parity outside Chromium remains out of scope for this milestone.

## Acceptance criteria
- User-triggered picker works on ordinary HTTPS sites without blanket host permissions.
- No duplicate overlay/listeners after repeated activation.
- Selection and Escape always clean up overlay/listeners.
- Sidepanel renders a serializable result with computed colors.
- Transparent and non-solid colors are not misrepresented as an opaque visible pixel color.
- No external telemetry or page-content transmission.
- Tests and production build run successfully.

## Later milestones
Pixel Eyedropper with browser support detection; history and export; CSS variables/source inspection; WCAG contrast; Firefox support.
