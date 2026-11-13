export interface ColorValue {
  raw: string;
  hex: string | null;
  rgb: string | null;
}
export interface ElementDetails {
  id: string | null;
  classes: string[];
  dataAttributes: Record<string, string>;
  ariaAttributes: Record<string, string>;
  attributes: Record<string, string>;
}
export interface PixelSample {
  source: 'pixel';
  hex: string;
  rgb: string;
}
export interface ElementInspection {
  tagName: string;
  selector: string | null;
  details: ElementDetails;
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
export type InspectionHistoryItem =
  | {
      kind: 'element';
      id: string;
      capturedAt: string;
      inspection: ElementInspection;
    }
  | {
      kind: 'pixel';
      id: string;
      capturedAt: string;
      sample: PixelSample;
    };
export type InspectorCommand = { type: 'PICKER_START' | 'PICKER_STOP'; requestId: string };
export type InspectorEvent =
  | { type: 'ELEMENT_SELECTED'; requestId: string; payload: ElementInspection }
  | { type: 'PICKER_CANCELLED'; requestId: string }
  | { type: 'PICKER_ERROR'; requestId: string; message: string };
