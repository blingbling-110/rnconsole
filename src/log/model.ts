import * as tool from "../lib/tool";
import { RNConsoleModel } from "../lib/model";
import { contentStore } from "../core/model";
import { getLogDatasWithFormatting } from "./tool";
import { RNConsoleLogStore as Store } from "./store";
import { MAX_LOG_NUMBER } from ".";

/**********************************
 * Interfaces
 **********************************/

export type IConsoleLogMethod = "log" | "info" | "debug" | "warn" | "error";

export interface IRNConsoleLogData {
  origData: any; // The original logging data
  style?: string;
}

export interface IRNConsoleLog {
  _id: string;
  type: IConsoleLogMethod;
  cmdType?: "input" | "output";
  repeated: number;
  toggle: Record<string, boolean>;
  date: number;
  data: IRNConsoleLogData[]; // the `args: any[]` of `console.log(...args)`
  // hide?: boolean;
  groupLevel: number;
  groupLabel?: symbol;
  groupHeader?: 0 | 1 | 2; // 0=not_header, 1=is_header(no_collapsed), 2=is_header(collapsed)
  groupCollapsed?: boolean; // collapsed by it's group header
}

export type IRNConsoleLogListMap = { [pluginId: string]: IRNConsoleLog[] };
export type IRNConsoleLogFilter = { [pluginId: string]: string };

export interface IRNConsoleAddLogOptions {
  noOrig?: boolean;
  cmdType?: "input" | "output";
}

/**********************************
 * Model
 **********************************/

export class RNConsoleLogModel extends RNConsoleModel {
  public readonly LOG_METHODS: IConsoleLogMethod[] = [
    "log",
    "info",
    "warn",
    "debug",
    "error",
  ];
  public ADDED_LOG_PLUGIN_ID: string[] = [];
  public maxLogNumber: number = MAX_LOG_NUMBER;
  protected logCounter: number = 0; // a counter used to do some tasks on a regular basis
  protected groupLevel: number = 0; // for `console.group()`
  protected groupLabelCollapsedStack: { label: symbol; collapsed: boolean }[] =
    [];
  protected pluginPattern!: RegExp;
  protected logQueue: IRNConsoleLog[] = [];
  protected flushLogScheduled: boolean = false;

  /**
   * The original `window.console` methods.
   */
  public origConsole: { [method: string]: Function } = {};

  /**
   * Bind a Log plugin.
   * When binding first plugin, `window.console` will be hooked.
   */
  public bindPlugin(pluginId: string) {
    if (this.ADDED_LOG_PLUGIN_ID.indexOf(pluginId) > -1) {
      return false;
    }
    if (this.ADDED_LOG_PLUGIN_ID.length === 0) {
      this.mockConsole();
    }

    // logStore.update((store) => {
    //   store[pluginId] = {
    //     logList: [],
    //   };
    //   return store;
    // });
    Store.create(pluginId);

    this.ADDED_LOG_PLUGIN_ID.push(pluginId);
    this.pluginPattern = new RegExp(
      `^\\[(${this.ADDED_LOG_PLUGIN_ID.join("|")})\\]$`,
      "i"
    );
    // this.callOriginalConsole('info', 'bindPlugin:', this.pluginPattern);
    return true;
  }

  /**
   * Unbind a Log plugin.
   * When no binded plugin exists, hooked `window.console` will be recovered.
   */
  public unbindPlugin(pluginId: string) {
    const idx = this.ADDED_LOG_PLUGIN_ID.indexOf(pluginId);
    if (idx === -1) {
      return false;
    }

    this.ADDED_LOG_PLUGIN_ID.splice(idx, 1);
    // logStore.update((store) => {
    //   store[pluginId].logList = [];
    //   delete store[pluginId];
    //   return store;
    // });
    Store.delete(pluginId);

    if (this.ADDED_LOG_PLUGIN_ID.length === 0) {
      this.unmockConsole();
    }
    return true;
  }

  /**
   * Hook `window.console` with RNConsole log method.
   * Methods will be hooked only once.
   */
  public mockConsole() {
    if (typeof this.origConsole.log === "function") {
      return;
    }

    // save original console object
    if (!globalThis.console) {
      (<any>globalThis.console) = {};
    } else {
      this.LOG_METHODS.map((method) => {
        this.origConsole[method] = globalThis.console[method];
      });
      this.origConsole.time = Reflect.get(globalThis.console, "time");
      this.origConsole.timeEnd = Reflect.get(globalThis.console, "timeEnd");
      this.origConsole.clear = Reflect.get(globalThis.console, "clear");
      this.origConsole.group = globalThis.console.group;
      this.origConsole.groupCollapsed = globalThis.console.groupCollapsed;
      this.origConsole.groupEnd = globalThis.console.groupEnd;
    }

    this._mockConsoleLog();
    this._mockConsoleTime();
    this._mockConsoleGroup();
    this._mockConsoleClear();

    // convenient for other uses
    (<any>globalThis)._rnOrigConsole = this.origConsole;
  }

  protected _mockConsoleLog() {
    this.LOG_METHODS.map((method) => {
      globalThis.console[method] = ((...args: any) => {
        this.addLog({
          type: method,
          origData: args || [],
        });
      }).bind(globalThis.console);
    });
  }

  protected _mockConsoleTime() {
    const timeLog: { [label: string]: number } = {};

    Reflect.set(
      globalThis.console,
      "time",
      ((label: string = "") => {
        timeLog[label] = Date.now();
      }).bind(globalThis.console)
    );

    Reflect.set(
      globalThis.console,
      "timeEnd",
      ((label: string = "") => {
        const pre = timeLog[label];
        let t = 0;
        if (pre) {
          t = Date.now() - pre;
          delete timeLog[label];
        }
        this.addLog({
          type: "log",
          origData: [`${label}: ${t}ms`],
        });
      }).bind(globalThis.console)
    );
  }

  protected _mockConsoleGroup() {
    const groupFunction = (isCollapsed: boolean) => {
      return ((label = "console.group") => {
        const labelSymbol = Symbol(label);
        this.groupLabelCollapsedStack.push({
          label: labelSymbol,
          collapsed: isCollapsed,
        });

        this.addLog(
          {
            type: "log",
            origData: [label],
            isGroupHeader: isCollapsed ? 2 : 1,
            isGroupCollapsed: false,
          },
          {
            noOrig: true,
          }
        );

        this.groupLevel++;
        if (isCollapsed) {
          this.origConsole.groupCollapsed(label);
        } else {
          this.origConsole.group(label);
        }
      }).bind(globalThis.console);
    };
    globalThis.console.group = groupFunction(false);
    globalThis.console.groupCollapsed = groupFunction(true);

    globalThis.console.groupEnd = (() => {
      this.groupLabelCollapsedStack.pop();
      this.groupLevel = Math.max(0, this.groupLevel - 1);
      this.origConsole.groupEnd();
    }).bind(globalThis.console);
  }

  protected _mockConsoleClear() {
    Reflect.set(
      globalThis.console,
      "clear",
      ((...args: any) => {
        this.clearLog();
        this.callOriginalConsole("clear", ...args);
      }).bind(globalThis.console)
    );
  }

  /**
   * Recover `window.console`.
   */
  public unmockConsole() {
    // recover original console methods
    for (const method in this.origConsole) {
      Reflect.set(globalThis.console, method, this.origConsole[method] as any);
      delete this.origConsole[method];
    }
    if ((<any>globalThis)._rnOrigConsole) {
      delete (<any>globalThis)._rnOrigConsole;
    }
  }

  /**
   * Call origin `window.console[method](...args)`
   */
  public callOriginalConsole(method: string, ...args: any[]) {
    if (typeof this.origConsole[method] === "function") {
      this.origConsole[method].apply(globalThis.console, args);
    }
  }

  /**
   * Remove all logs.
   */
  public clearLog() {
    // logStore.update((store) => {
    //   for (const id in store) {
    //     store[id].logList = [];
    //   }
    //   return store;
    // });
    const stores = Store.getAll();
    for (let id in stores) {
      stores[id].logList = [];
    }
  }

  /**
   * Remove a plugin's logs.
   */
  public clearPluginLog(pluginId: string) {
    // logStore.update((store) => {
    //   if (store[pluginId]) {
    //     store[pluginId].logList = [];
    //   }
    //   return store;
    // });
    Store.get(pluginId).logList = [];
  }

  /**
   * Add a RNConsole log.
   */
  public addLog(
    item: {
      type: IConsoleLogMethod;
      origData: any[];
      isGroupHeader?: 0 | 1 | 2;
      isGroupCollapsed?: boolean;
    } = {
      type: "log",
      origData: [],
      isGroupHeader: 0,
      isGroupCollapsed: false,
    },
    opt?: IRNConsoleAddLogOptions
  ) {
    // get group
    const previousGroup =
      this.groupLabelCollapsedStack[this.groupLabelCollapsedStack.length - 2];
    const currentGroup =
      this.groupLabelCollapsedStack[this.groupLabelCollapsedStack.length - 1];
    // prepare data
    const log: IRNConsoleLog = {
      _id: tool.getUniqueID(),
      type: item.type,
      cmdType: opt?.cmdType,
      toggle: {},
      date: Date.now(),
      data: getLogDatasWithFormatting(item.origData || []),
      repeated: 0,
      groupLabel: currentGroup?.label,
      groupLevel: this.groupLevel,
      groupHeader: item.isGroupHeader,
      groupCollapsed: item.isGroupHeader
        ? !!previousGroup?.collapsed
        : !!currentGroup?.collapsed,
    };

    this._signalLog(log);

    if (!opt?.noOrig) {
      // logging to original console
      this.callOriginalConsole(item.type, ...item.origData);
    }
  }

  protected _signalLog(log: IRNConsoleLog) {
    // throttle addLog
    if (!this.flushLogScheduled) {
      this.flushLogScheduled = true;
      requestAnimationFrame(() => {
        this.flushLogScheduled = false;
        this._flushLogs();
      });
    }
    this.logQueue.push(log);
  }

  protected _flushLogs() {
    const logQueue = this.logQueue;
    this.logQueue = [];
    const pluginLogs: Record<string, IRNConsoleLog[]> = {};

    // extract pluginId by `[xxx]` format
    for (const log of logQueue) {
      const pluginId = this._extractPluginIdByLog(log);

      (pluginLogs[pluginId] = pluginLogs[pluginId] || []).push(log);
    }

    const pluginIds = Object.keys(pluginLogs);
    for (const pluginId of pluginIds) {
      const logs = pluginLogs[pluginId];

      const store = Store.get(pluginId);
      let logList = [...store.logList];

      for (const log of logs) {
        if (this._isRepeatedLog(logList, log)) {
          this._updateLastLogRepeated(logList);
        } else {
          logList.push(log);
        }
      }

      logList = this._limitLogListLength(logList);
      store.logList = logList;
    }
    contentStore.updateTime();
  }

  protected _extractPluginIdByLog(log: IRNConsoleLog) {
    // if origData[0] is `[xxx]` format, and `xxx` is a Log plugin id,
    // then put this log to that plugin,
    // otherwise put it to default plugin.
    let pluginId = "default";
    const firstData = log.data[0]?.origData;
    if (tool.isString(firstData)) {
      const match = (firstData as string).match(this.pluginPattern);
      if (match !== null && match.length > 1) {
        const id = match[1].toLowerCase();
        if (this.ADDED_LOG_PLUGIN_ID.indexOf(id) > -1) {
          pluginId = id;
          // if matched, delete `[xxx]` value
          log.data.shift();
        }
      }
    }
    return pluginId;
  }

  protected _isRepeatedLog(logList: IRNConsoleLog[], log: IRNConsoleLog) {
    const lastLog = logList[logList.length - 1];
    if (!lastLog) {
      return false;
    }

    let isRepeated = false;
    if (
      log.type === lastLog.type &&
      log.cmdType === lastLog.cmdType &&
      log.data.length === lastLog.data.length
    ) {
      isRepeated = true;
      for (let i = 0; i < log.data.length; i++) {
        if (log.data[i].origData !== lastLog.data[i].origData) {
          isRepeated = false;
          break;
        }
      }
    }
    return isRepeated;
  }

  protected _updateLastLogRepeated(logList: IRNConsoleLog[]) {
    const last = logList[logList.length - 1];
    const repeated = last.repeated ? last.repeated + 1 : 2;
    logList[logList.length - 1] = {
      ...last,
      repeated,
    };
    return logList;
  }

  protected _limitLogListLength(logList: IRNConsoleLog[]): IRNConsoleLog[] {
    // update logList length every N rounds
    // const N = 10;
    // this.logCounter++;
    // if (this.logCounter % N !== 0) {
    //   return logList;
    // }
    // this.logCounter = 0;

    const len = logList.length;
    const maxLen = this.maxLogNumber;
    if (len > maxLen) {
      // delete N more logs for performance
      // this.callOriginalConsole('info', 'delete', len, len - maxLen);
      return logList.slice(len - maxLen, len);
    }
    return logList;
  }
}
