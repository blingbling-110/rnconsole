export interface RNConsoleLogOptions {
  maxLogNumber?: number;
}

export interface RNConsoleNetworkOptions {
  maxNetworkNumber?: number;
}

export interface RNConsoleOptions {
  defaultPlugins?: string[];
  disableLogScrolling?: boolean;
  pluginOrder?: string[];
  onReady?: () => void;

  log?: RNConsoleLogOptions;
  network?: RNConsoleNetworkOptions;
}
