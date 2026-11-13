import { configurePanelBehavior } from '../src/shared/browser/panel';

export default defineBackground(() => {
  void configurePanelBehavior();
});
