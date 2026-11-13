import { describe, expect, it } from 'vitest';
import { getContrastLevel, getContrastRatio } from '../../src/shared/color/contrast';

describe('contrast', () => {
  it('calculates the WCAG ratio for black and white', () => {
    const ratio = getContrastRatio(
      { raw: '#000', hex: '#000000', rgb: 'rgb(0 0 0)' },
      { raw: '#fff', hex: '#ffffff', rgb: 'rgb(255 255 255)' },
    );

    expect(ratio).toBeCloseTo(21, 4);
    expect(getContrastLevel(ratio)).toBe('AAA');
  });

  it('returns unavailable when a color is transparent or missing', () => {
    expect(getContrastRatio({ raw: 'transparent', hex: null, rgb: null }, null)).toBeNull();
    expect(getContrastLevel(null)).toBe('Unavailable');
  });

  it('marks low contrast as a WCAG failure', () => {
    const ratio = getContrastRatio(
      { raw: '#777', hex: '#777777', rgb: 'rgb(119 119 119)' },
      { raw: '#fff', hex: '#ffffff', rgb: 'rgb(255 255 255)' },
    );

    expect(getContrastLevel(ratio)).toBe('AA Large');
  });
});
