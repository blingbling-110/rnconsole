import { RNConsoleModel } from "../lib/model";
import { contentStore } from "../core/model";
import { RNConsoleNetworkRequestItem } from "./requestItem";
import { XHRProxy } from "./xhrProxy";
import { rnConsoleNetworkStore as Store } from "./store";
import { MAX_NETWORK_NUMBER } from ".";

/**
 * Network Model
 */
export class RNConsoleNetworkModel extends RNConsoleModel {
  public maxNetworkNumber: number = MAX_NETWORK_NUMBER;
  protected itemCounter: number = 0;

  constructor() {
    super();
    this.mockXHR();
  }

  public unMock() {
    // recover original functions
    if (globalThis.hasOwnProperty("XMLHttpRequest")) {
      globalThis.XMLHttpRequest = XHRProxy.origXMLHttpRequest;
    }
  }

  public clearLog() {
    // remove list
    for (const key of Object.keys(Store)) {
      delete Store[key];
    }
  }

  /**
   * Add or update a request item by request ID.
   */
  public updateRequest(id: string, data: RNConsoleNetworkRequestItem) {
    const hasItem = !!Store[id];
    if (hasItem) {
      // force re-assign to ensure that the value is updated
      const item = Store[id];
      for (let key in data) {
        Reflect.set(item, key, data[<keyof RNConsoleNetworkRequestItem>key]);
      }
      data = item;
    }
    Store[id] = data;
    if (!hasItem) {
      contentStore.updateTime();
      this.limitListLength();
    }
  }

  /**
   * mock XMLHttpRequest
   * @private
   */
  private mockXHR() {
    if (!globalThis.hasOwnProperty("XMLHttpRequest")) {
      return;
    }
    globalThis.XMLHttpRequest = XHRProxy.create(
      (item: RNConsoleNetworkRequestItem) => {
        this.updateRequest(item.id, item);
      }
    );
  }

  protected limitListLength() {
    // update list length every N rounds
    const N = 10;
    this.itemCounter++;
    if (this.itemCounter % N !== 0) {
      return;
    }
    this.itemCounter = 0;

    const keys = Object.keys(Store);
    if (keys.length > this.maxNetworkNumber - N) {
      // delete N more logs for performance
      const deleteKeys = keys.splice(
        0,
        keys.length - this.maxNetworkNumber + N
      );
      for (let i = 0; i < deleteKeys.length; i++) {
        Reflect.set(Store, deleteKeys[i], undefined);
        delete Store[deleteKeys[i]];
      }
    }
  }
} // END class

export default RNConsoleNetworkModel;
