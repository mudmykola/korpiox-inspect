import type { ColorValue } from '../messaging/contracts';

export type ContrastLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail' | 'Unavailable';

export function getContrastRatio(
  foreground: ColorValue | null,
  background: ColorValue | null,
): number | null {
  const foregroundRgb = parseHex(foreground?.hex);
  const backgroundRgb = parseHex(background?.hex);
  if (!foregroundRgb || !backgroundRgb) return null;

  const foregroundLuminance = getRelativeLuminance(foregroundRgb);
  const backgroundLuminance = getRelativeLuminance(backgroundRgb);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastLevel(ratio: number | null): ContrastLevel {
  if (ratio === null) return 'Unavailable';
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

function parseHex(hex: string | null | undefined): [number, number, number] | null {
  if (!hex) return null;
  const normalized = hex.replace('#', '');
  if (![3, 6].includes(normalized.length) || !/^[\da-f]+$/i.test(normalized)) return null;
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized;
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function getRelativeLuminance([red, green, blue]: [number, number, number]): number {
  const channels = [red, green, blue].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const [redLuminance, greenLuminance, blueLuminance] = channels;
  return (
    (redLuminance ?? 0) * 0.2126 + (greenLuminance ?? 0) * 0.7152 + (blueLuminance ?? 0) * 0.0722
  );
}
