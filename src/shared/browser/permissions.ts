import { browser } from 'wxt/browser';

export type PageAccessResult =
  | { ok: true; host: string }
  | { ok: false; reason: 'no-url' | 'unavailable' | 'denied'; host?: string };

/** Start this synchronously from a user gesture in Firefox. */
export function requestFirefoxHostAccess(): Promise<boolean> | null {
  return import.meta.env.FIREFOX
    ? browser.permissions.request({ origins: ['<all_urls>'] })
    : null;
}

export async function ensureOriginAccess(pageUrl: string): Promise<PageAccessResult> {
  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return { ok: false, reason: 'no-url' };
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    return { ok: false, reason: 'unavailable' };
  }

  const origin = `${url.protocol}//${url.host}/*`;
  const alreadyGranted = await browser.permissions.contains({ origins: [origin] });
  if (alreadyGranted) return { ok: true, host: url.host };

  const granted = await browser.permissions.request({ origins: [origin] });
  return granted
    ? { ok: true, host: url.host }
    : { ok: false, reason: 'denied', host: url.host };
}
