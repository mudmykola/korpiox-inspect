# Development & Scripts

This kit does not contain an initialized WXT application. Agent must create and verify package scripts against installed versions.

## Desired scripts
- `pnpm dev`: Chrome/Chromium development build.
- `pnpm dev:firefox`: Firefox development build.
- `pnpm build`: Chrome/Chromium production build.
- `pnpm build:firefox`: Firefox production build.
- `pnpm zip`: release archive (when supported).
- `pnpm lint`, `pnpm lint:fix`.
- `pnpm format`, `pnpm format:check`.
- `pnpm typecheck`.
- `pnpm test`: unit/integration.
- `pnpm test:e2e`: Playwright Chromium extension E2E.

Do not add fake scripts that exit successfully without checks. Align `.github/workflows/ci.yml` after scripts are defined. WXT may expose its own TypeScript checks and build commands; use current documentation.

## Manual QA
Open the matching unpacked build in Chrome/Chromium or Firefox. Test on the local fixture and an ordinary HTTPS page; inspect the background/service-worker console and panel/sidebar console; verify reload, navigation, stop, Escape, permission denial, copy and multiple activation. Browser-internal pages are expected to fail gracefully.
