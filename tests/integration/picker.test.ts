/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMessage } = vi.hoisted(() => ({ sendMessage: vi.fn() }));

vi.mock('wxt/browser', () => ({
  browser: { runtime: { sendMessage } },
}));

import { createPicker } from '../../src/features/element-picker/dom/createPicker';

describe('element picker lifecycle', () => {
  beforeEach(() => {
    document.getElementById('korpiox-inspect-picker-styles')?.remove();
    document.body.innerHTML =
      '<button id="primary" class="cta" data-testid="primary" aria-label="Inspect button">Inspect me</button>';
    sendMessage.mockReset();
  });

  it('creates one overlay and removes it on repeated start', () => {
    const picker = createPicker();

    picker.start('first');
    picker.start('second');

    expect(document.querySelectorAll('#korpiox-inspect-overlay')).toHaveLength(1);
    expect(document.querySelectorAll('#korpiox-inspect-picker-styles')).toHaveLength(1);
  });

  it('selects an element and sends serializable color data', () => {
    const picker = createPicker();
    const element = document.querySelector('#primary') as HTMLButtonElement;

    picker.start('select');
    element.dispatchEvent(new Event('pointermove', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('#korpiox-inspect-overlay')).toBeNull();
    expect(document.querySelector('#korpiox-inspect-picker-styles')).toBeNull();
    const selectedMessage = sendMessage.mock.calls[0]?.[0];
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ELEMENT_SELECTED',
        requestId: 'select',
        payload: expect.objectContaining({
          tagName: 'BUTTON',
          selector: '#primary',
          details: {
            id: 'primary',
            classes: ['cta'],
            dataAttributes: { 'data-testid': 'primary' },
            ariaAttributes: { 'aria-label': 'Inspect button' },
            attributes: {},
          },
          borderSides: expect.objectContaining({ top: expect.anything() }),
        }),
      }),
    );
    expect(selectedMessage.payload.details).not.toHaveProperty('value');
  });

  it('cancels on Escape and removes listeners and overlay', () => {
    const picker = createPicker();

    picker.start('escape');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(document.querySelector('#korpiox-inspect-overlay')).toBeNull();
    expect(document.querySelector('#korpiox-inspect-picker-styles')).toBeNull();
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({ type: 'PICKER_CANCELLED', requestId: 'escape' });
  });
});
