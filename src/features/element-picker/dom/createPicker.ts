import { normalizeColor } from '../../../shared/color/normalizeColor';
import type { ElementInspection, InspectorEvent } from '../../../shared/messaging/contracts';
import { browser } from 'wxt/browser';
import { extractElementDetails } from './extractElementDetails';
import { installPickerStyles, pickerClasses, removePickerStyles } from './pickerStyles';

const OVERLAY_ID = 'korpiox-inspect-overlay';

export function createPicker() {
  let selectedRequestId: string | null = null;
  let current: Element | null = null;
  let overlay: HTMLDivElement | null = null;
  let overlayLabel: HTMLDivElement | null = null;

  const send = (message: InspectorEvent) => browser.runtime.sendMessage(message);
  const cleanup = () => {
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    overlay?.remove();
    removePickerStyles();
    overlay = null;
    overlayLabel = null;
    current = null;
  };
  const onMove = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element) || target.id === OVERLAY_ID) return;
    current = target;
    const rect = target.getBoundingClientRect();
    if (!overlay) return;
    setOverlayBounds(overlay, rect);
    if (overlayLabel) {
      overlayLabel.textContent = `${target.tagName.toLowerCase()}${getSelector(target) ? ` · ${getSelector(target)}` : ''}`;
    }
  };
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!current || !selectedRequestId) return;
    const style = getComputedStyle(current);
    const payload: ElementInspection = {
      tagName: current.tagName,
      selector: getSelector(current),
      details: extractElementDetails(current),
      colors: {
        text: normalizeColor(style.color),
        background: normalizeColor(style.backgroundColor),
        border: normalizeColor(style.borderTopColor),
      },
      borderSides: {
        top: normalizeColor(style.borderTopColor),
        right: normalizeColor(style.borderRightColor),
        bottom: normalizeColor(style.borderBottomColor),
        left: normalizeColor(style.borderLeftColor),
      },
    };
    const requestId = selectedRequestId;
    cleanup();
    selectedRequestId = null;
    void send({ type: 'ELEMENT_SELECTED', requestId, payload });
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && selectedRequestId) {
      const requestId = selectedRequestId;
      cleanup();
      selectedRequestId = null;
      void send({ type: 'PICKER_CANCELLED', requestId });
    }
  };

  return {
    start(requestId: string) {
      cleanup();
      selectedRequestId = requestId;
      installPickerStyles();
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.className = pickerClasses.overlay;
      overlayLabel = document.createElement('div');
      overlayLabel.className = pickerClasses.label;
      overlayLabel.textContent = 'Виберіть елемент';
      overlay.append(overlayLabel);
      document.documentElement.append(overlay);
      document.addEventListener('pointermove', onMove, true);
      document.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKeyDown, true);
    },
    stop(requestId: string) {
      if (selectedRequestId !== requestId) return;
      cleanup();
      selectedRequestId = null;
      void send({ type: 'PICKER_CANCELLED', requestId });
    },
  };
}

function setOverlayBounds(overlay: HTMLDivElement, rect: DOMRect) {
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function getSelector(element: Element): string | null {
  if (element.id) return `#${escapeSelectorPart(element.id)}`;
  const className =
    typeof element.className === 'string'
      ? element.className.split(/\s+/).filter(Boolean)[0]
      : undefined;
  return className
    ? `${element.tagName.toLowerCase()}.${escapeSelectorPart(className)}`
    : element.tagName.toLowerCase();
}

function escapeSelectorPart(value: string) {
  return globalThis.CSS?.escape
    ? globalThis.CSS.escape(value)
    : value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}
