# Architecture

## Runtime contexts
- **Sidepanel (Vue)**: presentation, local Pinia state, commands, clipboard.
- **Content script**: element hover/click capture, overlay, DOM and computed style inspection.
- **Background service worker**: optional browser lifecycle, action click, tab coordination and permission/injection orchestration. Must tolerate suspension.
- **Shared core**: color parsing/normalization, DTO types, validation and message contracts.

## Recommended structure (create incrementally)
```text
entrypoints/
  background.ts
  sidepanel/
    {index.html,main.ts,App.vue}
    components/
      header/{AppHeader.vue,HeaderLogo.vue}
      inspector/{InspectorStatus.vue,InspectorActions.vue,ErrorCard.vue}
      results/{ElementInspectionResult.vue,PixelSampleResult.vue}
      history/InspectionHistory.vue
      EmptyState.vue
src/
  features/element-picker/{dom/,services/}
  features/color-inspector/{components/,services/}
  features/inspector/useInspectorController.ts
  shared/{browser/,color/,messaging/,types/}
  stores/inspector.store.ts
  app/styles/
tests/{unit/,integration/,e2e/,fixtures/}
```
WXT's entrypoint naming and config must match its current official conventions. Create only needed files.

## Vue composition rules
- `entrypoints/sidepanel/App.vue` is a composition-only container. It connects feature components and the feature composable; it does not own browser calls, business logic or large markup sections.
- Organize sidepanel components by responsibility under `entrypoints/sidepanel/components/<feature>/`. Keep reusable sections in separate components with typed props and emits.
- Put state coordination, browser messaging, lifecycle listeners and side effects in `src/features/<feature>/use*.ts` composables or services.
- Presentational components must not import browser APIs or reach into page DOM. Preserve existing styling classes while performing structural refactors.

## Data flow
Sidepanel button -> typed command -> inject/activate picker in active tab -> pointer hover highlight -> click selection -> content script computes styles -> serializable inspection DTO -> sidepanel store -> UI. Cancel/stop removes listeners and overlay.

## Rules
- UI never reaches into page DOM directly.
- Content script does not import Vue or Pinia.
- Pure color functions do not import browser APIs.
- Avoid a global store shared across extension contexts.
- Prefer message routing directly between sidepanel and content script where supported; do not make background a mandatory hop.
- Runtime validation at messaging boundaries.
- The extension must survive tab reloads and sidepanel closure.

## Browser constraints
`getComputedStyle()` gives computed CSS values, not always visible pixel color. It cannot automatically identify the winning CSS declaration/source. CSS custom properties can be inspected but mapping a computed property to its originating variable requires additional analysis. Closed Shadow DOM and cross-origin iframes have access limits. Restricted browser pages cannot be inspected.
