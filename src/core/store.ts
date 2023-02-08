import { RNConsoleOptions } from "./options";
import { proxy, useSnapshot } from "valtio";

interface IComponentStore {
  disableScrolling: RNConsoleOptions["disableLogScrolling"];
  activedPluginId: string;
  pluginList: {
    [id: string]: any;
  };
  show: boolean;
  showSwitchButton: boolean;
  updateTime: number;
}

export const coreStore = proxy<IComponentStore>({
  disableScrolling: false,
  activedPluginId: "",
  pluginList: {},
  show: false,
  showSwitchButton: false,
  updateTime: Date.now(),
});

export const useRNConsoleStore = () => useSnapshot(coreStore);
