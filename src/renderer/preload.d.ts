import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: Channels, ...args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void,
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
        invoke(channel: Channels, ...args: unknown[]): any;
        removeListener(
          channel: Channels,
          func: (...args: unknown[]) => void,
        ): void;
        removeAllListeners(channel: Channels): void;
      };
    };
  }
}

export {};
