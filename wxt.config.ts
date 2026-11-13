import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'KORPIOX Inspect — інспектор кольорів',
    description:
      'Вибирайте елементи на сторінці й переглядайте їхні кольори, ID, класи та контраст WCAG у боковій панелі.',
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    permissions: ['activeTab', 'tabs', 'scripting', 'clipboardWrite'],
    optional_host_permissions: ['*://*/*'],
    action: {},
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
});
