export const PIXEL_PICKER_OVERLAY_ID = 'korpiox-inspect-pixel-overlay';
export const PIXEL_PICKER_STYLE_ID = 'korpiox-inspect-pixel-picker-styles';

const PIXEL_PICKER_STYLES = `
  #${PIXEL_PICKER_OVERLAY_ID} {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    pointer-events: none;
    cursor: crosshair;
  }

  .korpiox-inspect-pixel-marker {
    position: fixed;
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #0891b2, 0 2px 12px rgb(0 0 0 / 55%);
    transform: translate(-50%, -50%);
  }

  .korpiox-inspect-pixel-label {
    position: fixed;
    max-width: min(320px, 70vw);
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

export function installPixelPickerStyles() {
  if (document.getElementById(PIXEL_PICKER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PIXEL_PICKER_STYLE_ID;
  style.textContent = PIXEL_PICKER_STYLES;
  (document.head ?? document.documentElement).append(style);
}

export function removePixelPickerStyles() {
  document.getElementById(PIXEL_PICKER_STYLE_ID)?.remove();
}
