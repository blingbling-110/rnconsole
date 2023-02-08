import { RNConsolePluginExporter } from "../lib/pluginExporter";
import { RNConsoleLogModel } from "./model";
import { IConsoleLogMethod } from "./model";

export class RNConsoleLogExporter extends RNConsolePluginExporter {
  public model: RNConsoleLogModel = RNConsoleLogModel.getSingleton(
    RNConsoleLogModel,
    "RNConsoleLogModel"
  );

  public log(...args: any[]) {
    this.addLog("log", ...args);
  }

  public info(...args: any[]) {
    this.addLog("info", ...args);
  }

  public debug(...args: any[]) {
    this.addLog("debug", ...args);
  }

  public warn(...args: any[]) {
    this.addLog("warn", ...args);
  }

  public error(...args: any[]) {
    this.addLog("error", ...args);
  }

  public clear() {
    if (!this.model) {
      return;
    }
    this.model.clearPluginLog(this.pluginId);
  }

  protected addLog(method: IConsoleLogMethod, ...args: any[]) {
    if (!this.model) {
      return;
    }
    args.unshift("[" + this.pluginId + "]");
    this.model.addLog({ type: method, origData: args }, { noOrig: true });
  }
}
