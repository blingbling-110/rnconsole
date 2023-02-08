import { RNConsolePluginExporter } from "../lib/pluginExporter";
import { RNConsoleNetworkModel } from "./model";
import {
  RNConsoleNetworkRequestItem,
  RNConsoleNetworkRequestItemProxy,
} from "./requestItem";

export class RNConsoleNetworkExporter extends RNConsolePluginExporter {
  public model: RNConsoleNetworkModel = RNConsoleNetworkModel.getSingleton(
    RNConsoleNetworkModel,
    "RNConsoleNetworkModel"
  );

  public add(item: RNConsoleNetworkRequestItem) {
    const itemProxy = new RNConsoleNetworkRequestItemProxy(
      new RNConsoleNetworkRequestItem()
    );
    for (let key in item) {
      Reflect.set(itemProxy, key, item[<keyof RNConsoleNetworkRequestItem>key]);
    }
    itemProxy.startTime = itemProxy.startTime || Date.now();
    itemProxy.requestType = itemProxy.requestType || "custom";
    this.model.updateRequest(itemProxy.id, itemProxy);
    return itemProxy;
  }

  public update(id: string, item: RNConsoleNetworkRequestItem) {
    this.model.updateRequest(id, item);
  }

  public clear() {
    this.model.clearLog();
  }
}
