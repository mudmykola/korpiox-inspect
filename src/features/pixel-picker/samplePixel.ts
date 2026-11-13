import type { PixelSample } from '../../shared/messaging/contracts';

export function samplePixel(imageData: ImageData, x: number, y: number): PixelSample {
  const pixelIndex = (y * imageData.width + x) * 4;
  const red = imageData.data[pixelIndex] ?? 0;
  const green = imageData.data[pixelIndex + 1] ?? 0;
  const blue = imageData.data[pixelIndex + 2] ?? 0;
  const hex = [red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('');

  return {
    source: 'pixel',
    hex: `#${hex}`,
    rgb: `rgb(${red} ${green} ${blue})`,
  };
}
