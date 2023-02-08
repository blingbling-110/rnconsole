/**
 * RNConsole core class
 */

import { RNConsoleOptions } from "./options";

// helper
import * as tool from "../lib/tool";

// built-in plugins
import {
  IRNConsoleTopbarOptions,
  IRNConsolePluginEventName,
} from "../lib/plugin";
import { RNConsolePlugin } from "../lib/plugin";
import { RNConsoleLogPlugin } from "../log";
import { RNConsoleDefaultPlugin } from "../log/default";
import { RNConsoleSystemPlugin } from "../log/system";
import { RNConsoleNetworkPlugin } from "../network";

// built-in plugin exporters
import { RNConsoleLogExporter } from "../log/exporter";
import { RNConsoleNetworkExporter } from "../network/exporter";
import { coreStore } from "./store";

export class RNConsole {
  public version: string = "0.0.1"; // 注意要和package.json中的version保持同步
  public isInited: boolean = false;
  public option: RNConsoleOptions = {};

  protected pluginList: { [id: string]: any } = {}; // plugin instance

  // Export plugin methods
  public log!: RNConsoleLogExporter;
  public system!: RNConsoleLogExporter;
  public network!: RNConsoleNetworkExporter;

  // Export static classes
  public static RNConsolePlugin: typeof RNConsolePlugin;
  public static RNConsoleLogPlugin: typeof RNConsoleLogPlugin;
  public static RNConsoleDefaultPlugin: typeof RNConsoleDefaultPlugin;
  public static RNConsoleSystemPlugin: typeof RNConsoleSystemPlugin;
  public static RNConsoleNetworkPlugin: typeof RNConsoleNetworkPlugin;

  constructor(opt?: RNConsoleOptions) {
    if (!!RNConsole.instance && RNConsole.instance instanceof RNConsole) {
      console.debug("[RNConsole] RNConsole is already exists.");
      return RNConsole.instance;
    }
    RNConsole.instance = this;

    this.isInited = false;
    this.option = {
      defaultPlugins: ["system", "network"],
      log: {},
      network: {},
    };

    // merge options
    if (tool.isObject(opt)) {
      this.option = {
        ...this.option,
        ...opt,
      };
    }

    // add built-in plugins
    this._addBuiltInPlugins();

    // try to init
    if (this.isInited) {
      return;
    }
    this._updateStoreByOptions();
    this._autoRun();
  }

  /**
   * Get singleton instance.
   **/
  public static get instance() {
    return (<any>globalThis).__RNConsole_INSTANCE;
  }

  /**
   * Set singleton instance.
   **/
  public static set instance(value: RNConsole | undefined) {
    if (value !== undefined && !(value instanceof RNConsole)) {
      console.debug(
        "[RNConsole] Cannot set `RNConsole.instance` because the value is not the instance of RNConsole."
      );
      return;
    }
    (<any>globalThis).__RNConsole_INSTANCE = value;
  }

  /**
   * Add built-in plugins.
   */
  private _addBuiltInPlugins() {
    // add default log plugin
    this.addPlugin(new RNConsoleDefaultPlugin("default", "日志"));

    // add other built-in plugins according to user's config
    const list = this.option.defaultPlugins;
    const plugins = {
      // 'default': { proto: RNConsoleSystemPlugin, name: 'Log' },
      system: { proto: RNConsoleSystemPlugin, name: "System" },
      network: { proto: RNConsoleNetworkPlugin, name: "网络" },
    };
    if (!!list && tool.isArray(list)) {
      for (let i = 0; i < list.length; i++) {
        const pluginConf = Reflect.get(plugins, list[i]);
        if (!!pluginConf) {
          this.addPlugin(new pluginConf.proto(list[i], pluginConf.name));
        } else {
          console.debug("[RNConsole] Unrecognized default plugin ID:", list[i]);
        }
      }
    }
  }

  /**
   * set options into store
   */
  private _updateStoreByOptions() {
    if (!coreStore) {
      return;
    }

    if (coreStore.disableScrolling !== this.option.disableLogScrolling) {
      coreStore.disableScrolling = !!this.option.disableLogScrolling;
    }
  }

  /**
   * Auto run after initialization.
   * @private
   */
  private _autoRun() {
    this.isInited = true;

    // init plugins
    for (let id in this.pluginList) {
      this._initPlugin(this.pluginList[id]);
    }

    // show first plugin
    this._showFirstPluginWhenEmpty();

    this.triggerEvent("ready");
  }

  private _showFirstPluginWhenEmpty() {
    const pluginIds = Object.keys(this.pluginList);
    if (coreStore.activedPluginId === "" && pluginIds.length > 0) {
      this.showPlugin(pluginIds[0]);
    }
  }

  /**
   * Trigger a `RNConsole.option` event.
   */
  public triggerEvent(eventName: string, param?: any) {
    eventName = "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    if (tool.isFunction(this.option[eventName as keyof RNConsoleOptions])) {
      setTimeout(() => {
        (<Function>this.option[eventName as keyof RNConsoleOptions]).apply(
          this,
          param
        );
      }, 0);
    }
  }

  /**
   * Init a plugin.
   */
  private _initPlugin<T extends RNConsolePlugin>(plugin: T) {
    plugin.RNConsole = this;
    coreStore.pluginList[plugin.id] = {
      id: plugin.id,
      name: plugin.name,
      hasTabPanel: false,
      tabOptions: undefined,
      topbarList: [],
      toolbarList: [],
    };
    coreStore.pluginList = this._reorderPluginList(coreStore.pluginList);
    // start init
    plugin.trigger("init");
    // render tab (if it is a tab plugin then it should has tab-related events)
    plugin.trigger("renderTab", (tabComponent: () => JSX.Element) => {
      const pluginInfo = coreStore.pluginList[plugin.id];
      pluginInfo.hasTabPanel = true;
      pluginInfo.tabComponent = tabComponent;
    });
    // end init
    plugin.isReady = true;
    plugin.trigger("ready");
  }

  /**
   * Trigger an event for each plugin.
   */
  private _triggerPluginsEvent(eventName: IRNConsolePluginEventName) {
    for (let id in this.pluginList) {
      if (this.pluginList[id].isReady) {
        this.pluginList[id].trigger(eventName);
      }
    }
  }

  /**
   * Trigger an event by plugin's id.
   * @private
   */
  private _triggerPluginEvent(
    pluginId: string,
    eventName: IRNConsolePluginEventName
  ) {
    const plugin = this.pluginList[pluginId];
    if (!!plugin && plugin.isReady) {
      plugin.trigger(eventName);
    }
  }

  /**
   * Sorting plugin list by option `pluginOrder`.
   * Plugin not listed in `pluginOrder` will be put last.
   */
  private _reorderPluginList(pluginList: { [pluginID: string]: any }) {
    if (!tool.isArray(this.option.pluginOrder)) {
      return pluginList;
    }
    const keys = Object.keys(pluginList).sort((a, b) => {
      const ia = this.option.pluginOrder!.indexOf(a);
      const ib = this.option.pluginOrder!.indexOf(b);
      if (ia === ib) {
        return 0;
      }
      if (ia === -1) {
        return 1;
      }
      if (ib === -1) {
        return -1;
      }
      return ia - ib;
    });
    const newList: typeof pluginList = {};
    for (let i = 0; i < keys.length; i++) {
      newList[keys[i]] = pluginList[keys[i]];
    }
    return newList;
  }

  /**
   * Add a new plugin.
   */
  public addPlugin(plugin: RNConsolePlugin) {
    // ignore this plugin if it has already been installed
    if (this.pluginList[plugin.id] !== undefined) {
      console.debug(
        "[RNConsole] Plugin `" + plugin.id + "` has already been added."
      );
      return false;
    }
    this.pluginList[plugin.id] = plugin;
    // init plugin only if RNConsole is ready
    if (this.isInited) {
      this._initPlugin(plugin);
      // if it's the only plugin, show it by default
      this._showFirstPluginWhenEmpty();
    }
    return true;
  }

  /**
   * Remove a plugin.
   */
  public removePlugin(pluginID: string) {
    pluginID = (pluginID + "").toLowerCase();
    const plugin = this.pluginList[pluginID];
    // skip if is has not been installed
    if (plugin === undefined) {
      console.debug("[RNConsole] Plugin `" + pluginID + "` does not exist.");
      return false;
    }
    // trigger `remove` event before uninstall
    plugin.trigger("remove");
    try {
      delete this.pluginList[pluginID];
      delete coreStore.pluginList[pluginID];
    } catch (e) {
      this.pluginList[pluginID] = undefined;
      coreStore.pluginList[pluginID] = undefined;
    }
    coreStore.pluginList = coreStore.pluginList;
    // show the first plugin by default
    if (coreStore.activedPluginId == pluginID) {
      coreStore.activedPluginId = "";
      this._showFirstPluginWhenEmpty();
    }
    return true;
  }

  /**
   * Show console panel.
   */
  public show() {
    if (!this.isInited) {
      return;
    }
    coreStore.show = true;
    this._triggerPluginsEvent("showConsole");
  }

  /**
   * Hide console panel.
   */
  public hide() {
    if (!this.isInited) {
      return;
    }
    coreStore.show = false;
    this._triggerPluginsEvent("hideConsole");
  }

  /**
   * Show switch button
   */
  public showSwitch() {
    if (!this.isInited) {
      return;
    }
    coreStore.showSwitchButton = true;
  }

  /**
   * Hide switch button.
   */
  public hideSwitch() {
    if (!this.isInited) {
      return;
    }
    coreStore.showSwitchButton = false;
  }

  /**
   * Show a plugin panel.
   */
  public showPlugin(pluginId: string) {
    if (!this.isInited) {
      return;
    }
    if (!this.pluginList[pluginId]) {
      console.debug("[RNConsole] Plugin `" + pluginId + "` does not exist.");
    }
    // trigger plugin event
    coreStore.activedPluginId &&
      this._triggerPluginEvent(coreStore.activedPluginId, "hide");
    coreStore.activedPluginId = pluginId;
    this._triggerPluginEvent(coreStore.activedPluginId, "show");
  }

  /**
   * Update option(s).
   * @example `setOption('log.maxLogNumber', 20)`: set 'maxLogNumber' field only.
   * @example `setOption({ log: { maxLogNumber: 20 }})`: overwrite 'log' object.
   */
  public setOption(keyOrObj: any, value?: any) {
    if (typeof keyOrObj === "string") {
      // parse `a.b = val` to `a: { b: val }`
      const keys = keyOrObj.split(".");
      let opt: any = this.option;
      for (let i = 0; i < keys.length - 1; i++) {
        if (opt[keys[i]] === undefined) {
          opt[keys[i]] = {};
        }
        opt = opt[keys[i]];
      }
      opt[keys[keys.length - 1]] = value;
      this._triggerPluginsEvent("updateOption");
      this._updateStoreByOptions();
    } else if (tool.isObject(keyOrObj)) {
      for (let k in keyOrObj) {
        this.option[k as keyof RNConsoleOptions] = keyOrObj[k];
      }
      this._triggerPluginsEvent("updateOption");
      this._updateStoreByOptions();
    } else {
      console.debug(
        "[RNConsole] The first parameter of `RNConsole.setOption()` must be a string or an object."
      );
    }
  }
} // END class

// Export built-in plugins
RNConsole.RNConsolePlugin = RNConsolePlugin;
RNConsole.RNConsoleLogPlugin = RNConsoleLogPlugin;
RNConsole.RNConsoleDefaultPlugin = RNConsoleDefaultPlugin;
RNConsole.RNConsoleSystemPlugin = RNConsoleSystemPlugin;
RNConsole.RNConsoleNetworkPlugin = RNConsoleNetworkPlugin;

new RNConsole();
