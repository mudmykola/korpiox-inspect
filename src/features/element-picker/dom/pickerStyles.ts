export const PICKER_STYLE_ID = 'korpiox-inspect-picker-styles';
const PICKER_OVERLAY_CLASS = 'korpiox-inspect-overlay';
const PICKER_LABEL_CLASS = 'korpiox-inspect-overlay__label';

export const pickerClasses = {
  overlay: PICKER_OVERLAY_CLASS,
  label: PICKER_LABEL_CLASS,
} as const;

const PICKER_CSS = `
  .${PICKER_OVERLAY_CLASS} {
    position: absolute;
    z-index: 2147483647;
    pointer-events: none;
    border: 2px solid #22d3ee;
    background: rgb(34 211 238 / 12%);
  }

  .${PICKER_LABEL_CLASS} {
    position: absolute;
    top: -28px;
    left: 0;
    max-width: min(420px, 80vw);
    padding: 4px 8px;
    overflow: hidden;
    color: #cffafe;
    background: #0f172a;
    border: 1px solid #22d3ee;
    border-radius: 6px;
    font: 600 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export function installPickerStyles() {
  if (document.getElementById(PICKER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PICKER_STYLE_ID;
  style.dataset.korpioxPicker = 'true';
  style.textContent = PICKER_CSS;
  (document.head ?? document.documentElement).append(style);
}

export function removePickerStyles() {
  document.getElementById(PICKER_STYLE_ID)?.remove();
}
