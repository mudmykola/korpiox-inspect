import { browser } from 'wxt/browser';
import type { InspectorEvent } from '../../../shared/messaging/contracts';
import { samplePixel } from '../samplePixel';
import {
  installPixelPickerStyles,
  PIXEL_PICKER_OVERLAY_ID,
  removePixelPickerStyles,
} from './pixelPickerStyles';

export function createPixelPicker() {
  let requestId: string | null = null;
  let overlay: HTMLDivElement | null = null;
  let marker: HTMLDivElement | null = null;
  let label: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let imageData: ImageData | null = null;

  const send = (message: InspectorEvent) => browser.runtime.sendMessage(message);
  const cleanup = () => {
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    overlay?.remove();
    removePixelPickerStyles();
    overlay = null;
    marker = null;
    label = null;
    canvas = null;
    imageData = null;
  };

  const onMove = (event: PointerEvent) => {
    if (!marker || !label) return;
    marker.style.left = `${event.clientX}px`;
    marker.style.top = `${event.clientY}px`;
    label.style.left = `${event.clientX + 14}px`;
    label.style.top = `${event.clientY + 14}px`;
    label.textContent = imageData
      ? `x ${Math.round(event.clientX)} · y ${Math.round(event.clientY)}`
      : 'Завантаження знімка…';
  };

  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!requestId || !imageData) return;
    const x = clamp(
      Math.floor((event.clientX / window.innerWidth) * imageData.width),
      0,
      imageData.width - 1,
    );
    const y = clamp(
      Math.floor((event.clientY / window.innerHeight) * imageData.height),
      0,
      imageData.height - 1,
    );
    const selectedRequestId = requestId;
    const payload = samplePixel(imageData, x, y);
    cleanup();
    requestId = null;
    void send({ type: 'PIXEL_SELECTED', requestId: selectedRequestId, payload });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !requestId) return;
    const selectedRequestId = requestId;
    cleanup();
    requestId = null;
    void send({ type: 'PIXEL_PICKER_CANCELLED', requestId: selectedRequestId });
  };

  return {
    async start(nextRequestId: string, screenshot: string) {
      cleanup();
      requestId = nextRequestId;
      overlay = document.createElement('div');
      overlay.id = PIXEL_PICKER_OVERLAY_ID;
      overlay.className = 'korpiox-inspect-pixel-overlay';
      installPixelPickerStyles();
      marker = document.createElement('div');
      marker.className = 'korpiox-inspect-pixel-marker';
      label = document.createElement('div');
      label.className = 'korpiox-inspect-pixel-label';
      label.textContent = 'Завантаження знімка…';
      overlay.append(marker, label);
      (document.body ?? document.documentElement).append(overlay);
      document.addEventListener('pointermove', onMove, true);
      document.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKeyDown, true);

      const image = new Image();
      image.decoding = 'async';
      image.src = screenshot;
      try {
        await image.decode();
        canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable.');
        context.drawImage(image, 0, 0);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        if (label) label.textContent = 'Виберіть піксель · Escape для скасування';
      } catch {
        const failedRequestId = requestId;
        cleanup();
        requestId = null;
        if (failedRequestId) {
          void send({
            type: 'PICKER_ERROR',
            requestId: failedRequestId,
            message: 'Не вдалося підготувати знімок вкладки.',
          });
        }
      }
    },
    stop(nextRequestId: string) {
      if (requestId !== nextRequestId) return;
      cleanup();
      requestId = null;
      void send({ type: 'PIXEL_PICKER_CANCELLED', requestId: nextRequestId });
    },
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
