# Security & Privacy

## Principles

- Least privilege: use `activeTab` and `scripting` for on-demand injection, plus sidePanel permissions where required. The `tabs` permission is limited to reading the active tab URL so the sidepanel can request a single-origin optional host permission; it does not grant page access by itself. Only request `storage` if feature needs it.
- No broad host permissions or automatic inspection on every site for MVP.
- No external analytics, tracking, network collection, or page data transmission.
- No remote executable code or dynamic eval.
- No `innerHTML` from page content. Sanitize/escape any selector or attribute displayed in UI.
- Validate message shape and check trusted extension sender context as applicable.
- Do not trust page-influenced values (selectors, attributes, computed CSS strings).
- Respect CSP, browser sandbox and extension store policies.
- Avoid injecting page-context scripts unless explicitly justified and security reviewed.
- Minimize persistence; history must be opt-in and local.

## Permission review checklist

- Why is each manifest permission required?
- Can user gesture + `activeTab` replace broad host access?
- Are there restricted URL error states?
- Is every event listener/overlay cleaned up?
- Is any page-derived data persisted or transmitted?
- Is clipboard write initiated by user action?
- Is optional host access requested only for the active HTTP(S) origin and after the user starts picking?
- Does Pixel picker use the user-initiated EyeDropper API without screenshot, capture, or upload permissions?
- Firefox pixel picker may use `tabs.captureVisibleTab()` after explicit user action; keep the screenshot in memory only, sample the selected pixel locally, and never persist or transmit the image.
