declare module 'culori' {
  export interface RgbColor {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }
  export function parse(value: string): RgbColor | { mode: string; alpha?: number } | undefined;
  export function converter(mode: 'rgb'): (value: unknown) => RgbColor | undefined;
  export function formatCss(value: RgbColor): string;
}
