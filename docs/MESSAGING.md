# Messaging contracts

Use typed, serializable messages. Choose WXT/browser messaging APIs supported by the installed version; verify with docs.

```ts
export type InspectorCommand =
  | { type: 'PICKER_START'; requestId: string }
  | { type: 'PICKER_STOP'; requestId: string };

export interface ColorValue {
  raw: string;
  hex: string | null;
  rgb: string | null;
}

export interface ElementInspection {
  tagName: string;
  selector: string | null;
  colors: {
    text: ColorValue | null;
    background: ColorValue | null;
    border: ColorValue | null;
  };
}

export type InspectorEvent =
  | { type: 'ELEMENT_SELECTED'; requestId: string; payload: ElementInspection }
  | { type: 'PICKER_CANCELLED'; requestId: string }
  | { type: 'PICKER_ERROR'; requestId: string; message: string };
```

## Rules
- Validate messages at runtime; TypeScript alone is insufficient.
- Correlate replies using `requestId`.
- Tab ID is available to extension contexts or sender metadata; do not assume content scripts know it.
- Scope results to the tab that initiated inspection.
- Avoid stale replies after navigation or cancellation.
- Do not send DOM nodes, CSSStyleDeclaration, functions, circular objects or untrusted HTML.
- Handle `runtime.lastError`, absent receiver, invalid payload and timeouts where relevant.
