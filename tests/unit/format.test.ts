import { describe, expect, it } from 'vitest';
import { hexToHsl } from '../../src/shared/color/format';

describe('color formats', () => {
  it('converts hex to a compact HSL value', () => {
    expect(hexToHsl('#ff0000')).toBe('hsl(0 100% 50%)');
    expect(hexToHsl('#0ff')).toBe('hsl(180 100% 50%)');
  });

  it('returns null for unsupported hex values', () => {
    expect(hexToHsl('transparent')).toBeNull();
  });
});
