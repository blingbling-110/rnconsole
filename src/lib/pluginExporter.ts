import { RNConsoleModel } from "./model";

export class RNConsolePluginExporter {
  protected model?: RNConsoleModel;
  protected pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  public destroy() {
    this.model = undefined;
  }
}
