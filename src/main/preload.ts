import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'window'
  | 'show-window'
  | 'get-machine-id'
  | 'handle-login'
  | 'websocket-status'
  | 'open-url'
  | 'fetch-data'
  | 'fetch-user-data'
  | 'write-task'
  | 'remove-task'
  | 'write-profile'
  | 'remove-profile'
  | 'write-proxy'
  | 'remove-proxy'
  | 'write-harvester'
  | 'remove-harvester'
  | 'login-harvester'
  | 'login-harvester-success'
  | 'launch-harvester'
  | 'captcha'
  | 'captcha-success'
  | 'click-grecaptcha-checkbox'
  | 'click-hcaptcha-checkbox'
  | 'write-account'
  | 'write-settings'
  | 'write-misc'
  | 'api-key-connected'
  | 'ai-key-connected'
  | 'test-webhook'
  | 'check-for-updates'
  | 'update-downloaded'
  | 'restart-and-install'
  | 'send-to-brain'
  | 'brain-to-renderer'
  | 'machine-id';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: Channels, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener(channel: Channels, func: (...args: unknown[]) => void) {
      return ipcRenderer.removeListener(channel, func);
    },
    removeAllListeners(channel: Channels) {
      return ipcRenderer.removeAllListeners(channel);
    },
  },
});
