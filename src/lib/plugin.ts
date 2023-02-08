import { getUniqueID } from "../lib/tool";
import { RNConsolePluginExporter } from "./pluginExporter";
import { RNConsole } from "../core";

export type IRNConsolePluginEvent = (data?: any) => void;
export type IRNConsolePluginEventName =
  | "init"
  | "renderTab"
  | "ready"
  | "remove"
  | "updateOption"
  | "showConsole"
  | "hideConsole"
  | "show"
  | "hide";

export interface IRNConsoleTopbarOptions {
  name: string;
  className: string;
  actived?: boolean;
  data?: { [key: string]: string };
  onClick?: (e: Event, data?: any) => any;
}

export interface IRNConsoleToolbarOptions {
  name: string;
  global?: boolean;
  data?: { [key: string]: string };
  onClick?: (e: Event, data?: any) => any;
}

/**
 * RNConsole Plugin Base Class
 */
export class RNConsolePlugin {
  public isReady: boolean = false;
  public eventMap: Map<IRNConsolePluginEventName, IRNConsolePluginEvent> =
    new Map();
  public exporter?: RNConsolePluginExporter;
  protected _id!: string;
  protected _name!: string;
  protected _RNConsole!: RNConsole;

  constructor(...args: any);
  constructor(id: string, name = "newPlugin") {
    this.id = id;
    this.name = name;
    this.isReady = false;
  }

  get id() {
    return this._id;
  }
  set id(value: string) {
    if (typeof value !== "string") {
      throw "[RNConsole] Plugin ID must be a string.";
    } else if (!value) {
      throw "[RNConsole] Plugin ID cannot be empty.";
    }
    this._id = value.toLowerCase();
  }

  get name() {
    return this._name;
  }
  set name(value: string) {
    if (typeof value !== "string") {
      throw "[RNConsole] Plugin name must be a string.";
    } else if (!value) {
      throw "[RNConsole] Plugin name cannot be empty.";
    }
    this._name = value;
  }

  get RNConsole() {
    return this._RNConsole || undefined;
  }
  set RNConsole(value: RNConsole) {
    if (!value) {
      throw "[RNConsole] RNConsole cannot be empty";
    }
    this._RNConsole = value;
    this.bindExporter();
  }

  /**
   * Register an event
   * @public
   * @param IRNConsolePluginEventName
   * @param IRNConsolePluginEvent
   */
  public on(
    eventName: IRNConsolePluginEventName,
    callback: IRNConsolePluginEvent
  ) {
    this.eventMap.set(eventName, callback);
    return this;
  }

  public onRemove() {
    this.unbindExporter();
  }

  /**
   * Trigger an event.
   */
  public trigger(eventName: IRNConsolePluginEventName, data?: any) {
    const targetEvent = this.eventMap.get(eventName);
    if (typeof targetEvent === "function") {
      // registered by `.on()` method
      targetEvent.call(this, data);
    } else {
      // registered by `.onXxx()` method
      const method =
        "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
      if (typeof this[method as keyof this] === "function") {
        (<Function>this[method as keyof this]).call(this, data);
      }
    }
    return this;
  }

  protected bindExporter() {
    if (!this._RNConsole || !this.exporter) {
      return;
    }
    const id = this.id === "default" ? "log" : this.id;
    this._RNConsole[id as keyof RNConsole] = this.exporter as never;
  }

  protected unbindExporter() {
    const id = this.id === "default" ? "log" : this.id;
    if (this._RNConsole && this._RNConsole[id as keyof RNConsole]) {
      this._RNConsole[id as keyof RNConsole] = undefined as never;
    }
  }

  protected getUniqueID(prefix: string = "") {
    return getUniqueID(prefix);
  }
} // END class

export default RNConsolePlugin;
