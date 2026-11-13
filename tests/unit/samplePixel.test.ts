import { describe, expect, it } from 'vitest';
import { samplePixel } from '../../src/features/pixel-picker/samplePixel';

describe('samplePixel', () => {
  it('converts an image pixel to HEX and space-separated RGB', () => {
    const imageData = {
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([15, 160, 255, 255, 255, 0, 16, 255]),
    } as ImageData;

    expect(samplePixel(imageData, 0, 0)).toEqual({
      source: 'pixel',
      hex: '#0fa0ff',
      rgb: 'rgb(15 160 255)',
    });
    expect(samplePixel(imageData, 1, 0).hex).toBe('#ff0010');
  });
});
