import RNConsolePlugin from "../lib/plugin";
import { RNConsoleNetworkModel } from "./model";
import { RNConsoleNetworkExporter } from "./exporter";
import NetworkTab from "../components/NetworkTab";

export const MAX_NETWORK_NUMBER = 1000;

export class RNConsoleNetworkPlugin extends RNConsolePlugin {
  public model: RNConsoleNetworkModel = RNConsoleNetworkModel.getSingleton(
    RNConsoleNetworkModel,
    "RNConsoleNetworkModel"
  );
  public exporter: RNConsoleNetworkExporter;

  constructor(id: string, name: string, renderProps = {}) {
    super(id, name, renderProps);
    this.exporter = new RNConsoleNetworkExporter(id);
  }

  public onReady() {
    this.isReady = true;
    this.onUpdateOption();
  }

  public onRemove() {
    super.onRemove();
    if (this.model) {
      this.model.unMock();
    }
  }

  public onUpdateOption() {
    if (
      this.RNConsole.option.network?.maxNetworkNumber !==
      this.model.maxNetworkNumber
    ) {
      this.model.maxNetworkNumber =
        Number(this.RNConsole.option.network?.maxNetworkNumber) ||
        MAX_NETWORK_NUMBER;
    }
  }

  public onRenderTab(callback: Function) {
    callback(NetworkTab);
  }
}
