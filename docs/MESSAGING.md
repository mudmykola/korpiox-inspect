# Messaging contracts

Use typed, serializable messages. The source of truth is
`src/shared/messaging/contracts.ts`; keep this document aligned with it.

```ts
export type InspectorCommand =
  | { type: 'PICKER_START' | 'PICKER_STOP'; requestId: string }
  | { type: 'PIXEL_PICKER_START'; requestId: string; screenshot: string }
  | { type: 'PIXEL_PICKER_STOP'; requestId: string };

export interface ColorValue {
  raw: string;
  hex: string | null;
  rgb: string | null;
}

export interface ElementInspection {
  tagName: string;
  selector: string | null;
  details: {
    id: string | null;
    classes: string[];
    dataAttributes: Record<string, string>;
    ariaAttributes: Record<string, string>;
    attributes: Record<string, string>;
  };
  colors: {
    text: ColorValue | null;
    background: ColorValue | null;
    border: ColorValue | null;
  };
  borderSides: {
    top: ColorValue | null;
    right: ColorValue | null;
    bottom: ColorValue | null;
    left: ColorValue | null;
  };
}

export interface PixelSample {
  source: 'pixel';
  hex: string;
  rgb: string;
}

export type InspectorEvent =
  | { type: 'ELEMENT_SELECTED'; requestId: string; payload: ElementInspection }
  | { type: 'PIXEL_SELECTED'; requestId: string; payload: PixelSample }
  | { type: 'PICKER_CANCELLED'; requestId: string }
  | { type: 'PIXEL_PICKER_CANCELLED'; requestId: string }
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
