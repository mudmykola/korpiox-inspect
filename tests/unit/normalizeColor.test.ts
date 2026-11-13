import { describe, expect, it } from 'vitest';
import { normalizeColor } from '../../src/shared/color/normalizeColor';

describe('normalizeColor', () => {
  it('normalizes hex and rgb values', () => {
    expect(normalizeColor('#0ff')).toMatchObject({ raw: '#0ff', hex: '#00ffff' });
    expect(normalizeColor('rgb(255, 0, 0)')).toMatchObject({ hex: '#ff0000' });
  });
  it('does not represent transparency as an opaque color', () => {
    expect(normalizeColor('transparent')).toMatchObject({ hex: null, rgb: null });
    expect(normalizeColor('rgba(0, 0, 0, 0.4)')).toMatchObject({ hex: null, rgb: null });
  });
  it('preserves raw unsupported values', () => {
    expect(normalizeColor('var(--brand)')).toMatchObject({ raw: 'var(--brand)', hex: null });
  });
});
