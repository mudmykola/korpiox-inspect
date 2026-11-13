import { browser } from 'wxt/browser';
import type { PixelSample } from '../messaging/contracts';

export function supportsNativePixelPicker() {
  return !import.meta.env.FIREFOX && typeof window.EyeDropper === 'function';
}

export async function openNativePixelPicker(): Promise<PixelSample> {
  const EyeDropper = window.EyeDropper;
  if (!supportsNativePixelPicker() || !EyeDropper) {
    throw new Error('Native pixel picker is unavailable.');
  }

  const result = await new EyeDropper().open();
  const hex = result.sRGBHex.toLowerCase();
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  return {
    source: 'pixel',
    hex,
    rgb: `rgb(${channels.join(' ')})`,
  };
}

export function captureVisibleTab(windowId: number) {
  return browser.tabs.captureVisibleTab(windowId, { format: 'png' });
}
