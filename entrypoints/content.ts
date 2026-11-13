import { createPicker } from '../src/features/element-picker/dom/createPicker';
import type { InspectorCommand } from '../src/shared/messaging/contracts';
import { browser } from 'wxt/browser';

const picker = createPicker();

export default defineContentScript({
  matches: [],
  registration: 'runtime',
  runAt: 'document_idle',
  main() {
    browser.runtime.onMessage.addListener((message: InspectorCommand) => {
      if (message.type === 'PICKER_START') picker.start(message.requestId);
      if (message.type === 'PICKER_STOP') picker.stop(message.requestId);
    });
  },
});
