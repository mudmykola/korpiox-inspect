import { converter, formatCss, parse } from 'culori';
import type { ColorValue } from '../messaging/contracts';

const toRgb = converter('rgb');

export function normalizeColor(raw: string): ColorValue | null {
  const value = raw.trim();
  if (!value || value === 'transparent') return value ? { raw: value, hex: null, rgb: null } : null;
  const parsed = parse(value);
  const rgb = parsed ? toRgb(parsed) : undefined;
  if (!rgb || (rgb.alpha ?? 1) < 1) return { raw: value, hex: null, rgb: null };
  const css = formatCss({ mode: 'rgb', r: rgb.r, g: rgb.g, b: rgb.b });
  const channels = [rgb.r, rgb.g, rgb.b].map((channel) =>
    Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0'),
  );
  return { raw: value, hex: `#${channels.join('')}`, rgb: css };
}
