# KORPIOX Inspect User Guide

KORPIOX Inspect is a privacy-first browser extension for checking webpage colors, contrast and element metadata without opening the full browser DevTools.

This guide covers the developer-preview installation from the repository. It is not a Chrome Web Store or Firefox Add-ons installation guide.

## Requirements

- Chrome, Chromium or another Chromium-based browser for the primary workflow;
- Firefox is supported through the separate Firefox build;
- Node.js with Corepack or pnpm 10.26+;
- a local clone of this repository.

## Install the developer preview in Chrome

From the repository root, install dependencies and build the unpacked extension:

```bash
cd "/Users/kaffein/MY PROJECT/Development/Vue/mud-color-inspector"
pnpm install
pnpm build
```

The generated Chromium extension is located at:

```text
.output/chrome-mv3
```

To load it:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the repository's `.output/chrome-mv3` directory.
5. Open the extension side panel from the toolbar or the browser side panel menu.

After source changes, run `pnpm build` again and click **Reload** on the extension card before testing the new build.

## First inspection

1. Open an ordinary `https://` webpage.
2. Open the KORPIOX Inspect side panel.
3. Click **Pick Element**.
4. Move over the page and click an element.
5. Read the selected tag, selector, colors and contrast result.
6. Press **Escape** or click **Stop** to cancel an active selection.

The first inspection on a site can show a permission prompt. Allow access only when you want to inspect that site.

## Element picker

The element picker reports:

- computed text, background and border colors;
- HEX and RGB values when conversion is meaningful;
- the selected tag and best-effort selector;
- ID, classes, `data-*`, `aria-*` and selected attributes;
- WCAG text/background contrast;
- all four border-side colors.

Click a HEX or RGB value to copy it. Use **Copy JSON** for the complete inspection or **Developer details** for the metadata JSON.

## Pixel picker

Click **Pick Pixel** to sample a screen color.

- In Chrome/Chromium, the native EyeDropper is used when the browser supports it.
- In Firefox, KORPIOX Inspect captures the visible tab viewport locally and samples the clicked coordinate from that image.
- Firefox pixel sampling does not include browser chrome, other windows or content outside the visible viewport.
- Press **Escape** to cancel pixel selection.

The screenshot is processed in memory and is not uploaded or persisted.

## History and export

Open the **History** tab to view recent element inspections and pixel samples.

- Click an item to restore it in the Inspector tab.
- Use the download button to export local history as JSON.
- Use the trash button beside an item to remove it.
- Use the clear button to remove the complete history.

History is stored locally in the extension page. There is no account or cloud sync.

## Permissions and privacy

KORPIOX Inspect uses user-triggered permissions for inspection:

- `activeTab`, `scripting` and `tabs` support the active-tab workflow;
- Chrome requests access to the current HTTP(S) origin when inspection starts;
- Firefox requests optional `<all_urls>` access because its visible-tab capture API requires it when the sidebar action does not grant `activeTab`;
- `clipboardWrite` is used only after you click a copy action.

Page data and sampled colors stay in the browser. The extension does not use analytics, remote telemetry, scraping, network upload or remote executable code.

## Firefox installation

Build the Firefox artifact:

```bash
cd "/Users/kaffein/MY PROJECT/Development/Vue/mud-color-inspector"
pnpm build:firefox
```

Then:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select:

   ```text
   .output/firefox-mv2/manifest.json
   ```

4. Open **KORPIOX Inspect** from the Firefox sidebar.

Temporary add-ons are removed when Firefox restarts. After source changes, rebuild and click **Reload**, or remove and load the manifest again if the manifest permissions changed.

## Troubleshooting

### The extension is not visible after a source change

Run the build command again and click **Reload** on the extension card. The browser runs the generated output, not the TypeScript source files.

### The picker says that the active tab or permission is unavailable

Use an ordinary HTTP(S) webpage. Browser-internal pages such as `chrome://`, `about:`, extension pages, PDF viewers and store pages restrict script injection. On Firefox, remove and reload the latest `.output/firefox-mv2/manifest.json` after a manifest permission change, then allow the requested site access.

### Firefox reports `Missing activeTab permission`

Rebuild the Firefox artifact and reload it from `.output/firefox-mv2/manifest.json`. The current Firefox build requests optional `<all_urls>` access before visible-tab pixel capture. Click **Pick Pixel** and accept the permission prompt.

### Firefox reports `permissions.request may only be called from a user input handler`

The browser is running an older build. Run `pnpm build:firefox`, then reload or reinstall the temporary add-on. The current build starts the permission request directly from the button click.

### Pixel picking is unavailable

Chrome/Chromium may not expose native EyeDropper in every environment. Use the element picker as the fallback. In Firefox, use the latest Firefox build and allow the visible-tab capture permission.

### Copy does not work

Clipboard access must be triggered by clicking a copy button. If the browser blocks clipboard access, copy the displayed value manually.

### History is empty after restarting Firefox

The `about:debugging` installation is temporary. Reloading or restarting can change the temporary extension session. Do not treat the temporary preview as a persistent distribution install.

## Developer quality checks

Run the local checks from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm build:firefox
```

These checks validate the code and generated artifacts. They do not replace manual browser testing of the side panel/sidebar, permissions, picker lifecycle and restricted pages.

## Distribution status

This repository currently provides a developer preview loaded as an unpacked or temporary extension. Chrome Web Store and Firefox Add-ons signing, review, screenshots and public distribution are not part of this installation flow.
