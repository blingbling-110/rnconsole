import { RNConsolePlugin } from "../lib/plugin";
import { RNConsoleLogModel } from "./model";
import { RNConsoleLogExporter } from "./exporter";
import LogTab from "../components/LogTab";

export const MAX_LOG_NUMBER = 1000;

/**
 * RNConsole Log Plugin (base class).
 */
export class RNConsoleLogPlugin extends RNConsolePlugin {
  public model: RNConsoleLogModel = RNConsoleLogModel.getSingleton(
    RNConsoleLogModel,
    "RNConsoleLogModel"
  );
  public isReady: boolean = false;

  constructor(id: string, name: string) {
    super(id, name, { pluginId: id, filterType: "all" });
    this.model.bindPlugin(id);
    this.exporter = new RNConsoleLogExporter(id);
  }

  public onReady() {
    this.isReady = true;
    this.model.maxLogNumber =
      Number(this.RNConsole.option.log?.maxLogNumber) || MAX_LOG_NUMBER;
  }

  public onRemove() {
    super.onRemove();
    this.model.unbindPlugin(this.id);
  }

  public onUpdateOption() {
    if (this.RNConsole.option.log?.maxLogNumber !== this.model.maxLogNumber) {
      this.model.maxLogNumber =
        Number(this.RNConsole.option.log?.maxLogNumber) || MAX_LOG_NUMBER;
    }
  }

  public onRenderTab(callback: Function) {
    callback(LogTab);
  }
}

export default RNConsoleLogPlugin;
