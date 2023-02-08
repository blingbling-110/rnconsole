import { IRNConsoleLog } from "./model";
import { proxy, useSnapshot } from "valtio";

export interface IRNConsoleLogStore {
  logList: IRNConsoleLog[];
  systemInfo?: {
    [k: string]: {
      key: string;
      value: string;
    };
  };
}

/**
 * Log Store Factory
 */
export class RNConsoleLogStore {
  public static storeMap: { [pluginId: string]: IRNConsoleLogStore } = {};

  /**
   * Create a store.
   */
  public static create(pluginId: string) {
    if (!this.storeMap[pluginId]) {
      if (pluginId === "system") {
        this.storeMap[pluginId] = proxy({ logList: [], systemInfo: {} });
      } else {
        this.storeMap[pluginId] = proxy({ logList: [] });
      }
    }
    return this.storeMap[pluginId];
  }

  /**
   * Delete a store.
   */
  public static delete(pluginId: string) {
    if (!this.storeMap[pluginId]) {
      return;
    }
    delete this.storeMap[pluginId];
  }

  /**
   * Get a store by pluginId,
   */
  public static get(pluginId: string) {
    return this.storeMap[pluginId];
  }

  /**ff
   * Get all stores.
   */
  public static getAll() {
    return this.storeMap;
  }
}

export const useRNConsoleLogStore = () =>
  useSnapshot(RNConsoleLogStore.get("default")).logList;

export const useRNConsoleSystemStore = () =>
  useSnapshot(RNConsoleLogStore.get("system")).systemInfo;
