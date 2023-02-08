type AConstructorTypeOf<T, U extends any[] = any[]> = new (...args: U) => T;

export class RNConsoleModel {
  public static singleton: { [ctorName: string] : RNConsoleModel } = {};
  protected _onDataUpdateCallbacks: Function[] = [];

  /**
   * Get a singleton of a model.
   */
  public static getSingleton<T extends RNConsoleModel>(ctor: AConstructorTypeOf<T>, ctorName: string): T {
    if (!ctorName) {
      // WARN: the constructor name will be rewritten after minimize,
      //       so the `ctor.prototype.constructor.name` will likely conflict,
      //       so the ctor string as a guarantee when ctorName is empty.
      ctorName = ctor.toString();
    }
    // console.log(ctorName, ctor);
    if (RNConsoleModel.singleton[ctorName]) {
      return <T>RNConsoleModel.singleton[ctorName];
    }
    RNConsoleModel.singleton[ctorName] = new ctor();
    return <T>RNConsoleModel.singleton[ctorName];
  }
}

export default RNConsoleModel;
