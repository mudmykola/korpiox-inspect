import { browser } from 'wxt/browser';

export async function configurePanelBehavior() {
  if (!import.meta.env.CHROME) return;

  await browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}
