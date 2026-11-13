/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMessage } = vi.hoisted(() => ({ sendMessage: vi.fn() }));

vi.mock('wxt/browser', () => ({
  browser: { runtime: { sendMessage } },
}));

import { createPixelPicker } from '../../src/features/pixel-picker/dom/createPixelPicker';

const SCREENSHOT = 'data:image/png;base64,fixture';

describe('pixel picker lifecycle', () => {
  beforeEach(() => {
    document.getElementById('korpiox-inspect-pixel-picker-styles')?.remove();
    document.body.innerHTML = '';
    sendMessage.mockReset();
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 2;
        naturalHeight = 1;
        decoding = 'async';
        src = '';

        decode() {
          return Promise.resolve();
        }
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        ({
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({
            width: 2,
            height: 1,
            data: new Uint8ClampedArray([255, 0, 128, 255, 0, 64, 32, 255]),
          })),
        }) as unknown as CanvasRenderingContext2D,
    );
  });

  it('keeps one overlay and one style after repeated start', async () => {
    const picker = createPixelPicker();

    await picker.start('first', SCREENSHOT);
    await picker.start('second', SCREENSHOT);

    expect(document.querySelectorAll('#korpiox-inspect-pixel-overlay')).toHaveLength(1);
    expect(document.querySelectorAll('#korpiox-inspect-pixel-picker-styles')).toHaveLength(1);
    expect(document.querySelector('.korpiox-inspect-pixel-marker')).not.toBeNull();
  });

  it('selects a pixel and removes the overlay and styles', async () => {
    const picker = createPixelPicker();

    await picker.start('select', SCREENSHOT);
    document.dispatchEvent(new MouseEvent('click', { clientX: 0, clientY: 0, bubbles: true }));

    expect(document.querySelector('#korpiox-inspect-pixel-overlay')).toBeNull();
    expect(document.querySelector('#korpiox-inspect-pixel-picker-styles')).toBeNull();
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'PIXEL_SELECTED',
      requestId: 'select',
      payload: { source: 'pixel', hex: '#ff0080', rgb: 'rgb(255 0 128)' },
    });
  });

  it('cancels once on Escape and cleans up', async () => {
    const picker = createPixelPicker();

    await picker.start('escape', SCREENSHOT);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(document.querySelector('#korpiox-inspect-pixel-overlay')).toBeNull();
    expect(document.querySelector('#korpiox-inspect-pixel-picker-styles')).toBeNull();
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'PIXEL_PICKER_CANCELLED',
      requestId: 'escape',
    });
  });

  it('ignores a stale stop and cancels the active request', async () => {
    const picker = createPixelPicker();

    await picker.start('active', SCREENSHOT);
    picker.stop('stale');
    expect(document.querySelector('#korpiox-inspect-pixel-overlay')).not.toBeNull();
    expect(sendMessage).not.toHaveBeenCalled();

    picker.stop('active');
    expect(document.querySelector('#korpiox-inspect-pixel-overlay')).toBeNull();
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'PIXEL_PICKER_CANCELLED',
      requestId: 'active',
    });
  });
});
