import * as tool from "../lib/tool";
import { RNConsoleLogPlugin } from ".";

export class RNConsoleDefaultPlugin extends RNConsoleLogPlugin {
  protected originErrorHandler = ErrorUtils.getGlobalHandler();
  protected onErrorHandler: any;
  protected rejectionHandler: any;

  public onReady() {
    super.onReady();
    this.bindErrors();
  }

  public onRemove() {
    super.onRemove();
    this.unbindErrors();
  }

  /**
   * Catch react native errors.
   */
  protected bindErrors() {
    if (!tool.isFunction(ErrorUtils.setGlobalHandler)) {
      return;
    }
    this.catchGlobalError();
    this.catchUnhandledRejection();
  }

  /**
   * Not catch react native errors.
   */
  protected unbindErrors() {
    if (!tool.isFunction(ErrorUtils.setGlobalHandler)) {
      return;
    }
    ErrorUtils.setGlobalHandler(this.originErrorHandler);
    this.unbindUnhandledRejection();
  }

  /**
   * Catch `JavaScript error`.
   * @reference https://github.com/facebook/react-native/blob/main/packages/polyfills/error-guard.js
   */
  protected catchGlobalError() {
    this.onErrorHandler = this.onErrorHandler
      ? this.onErrorHandler
      : (error: any, isFatal?: boolean) => {
          let msg = isFatal ? "Fatal! " : "";
          msg += error.message;
          if (error.filename) {
            msg += "\\n\\t" + error.filename;
            if (error.lineno || error.colno) {
              msg += ":" + error.lineno + ":" + error.colno;
            }
          }
          // print error stack info
          const hasStack = !!error.stack;
          const stackInfo = (hasStack && error.stack.toString()) || "";
          msg += "\\n" + stackInfo;
          this.model.addLog(
            {
              type: "error",
              origData: [msg],
            },
            { noOrig: true }
          );
        };
    ErrorUtils.setGlobalHandler(this.onErrorHandler);
  }

  /**
   * Catch `Promise.reject`.
   * @reference https://github.com/facebook/react-native/blob/main/Libraries/Promise.js
   */
  private catchUnhandledRejection() {
    this.rejectionHandler = this.rejectionHandler
      ? this.rejectionHandler
      : (_: number, rejection = {}) => {
          const errorName = "Uncaught (in promise) ";
          let args = [errorName, rejection];
          if (rejection instanceof Error) {
            args = [
              errorName,
              {
                name: rejection.name,
                message: rejection.message,
                stack: rejection.stack,
              },
            ];
          }
          this.model.addLog(
            {
              type: "error",
              origData: args,
            },
            { noOrig: true }
          );
        };
    require("promise/setimmediate/rejection-tracking").enable({
      allRejections: true,
      onUnhandled: this.rejectionHandler,
      onHandled: (id: number) => {
        const warning =
          `Promise Rejection Handled (id: ${id})\n` +
          "This means you can ignore any previous messages of the form " +
          `"Possible Unhandled Promise Rejection (id: ${id}):"`;
        console.warn(warning);
      },
    });
  }

  protected unbindUnhandledRejection() {
    require("promise/setimmediate/rejection-tracking").enable({
      allRejections: true,
      onUnhandled: (id: number, rejection = {}) => {
        let message: string;
        let stack: string | undefined;

        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        const stringValue = Object.prototype.toString.call(rejection);
        if (stringValue === "[object Error]") {
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          message = Error.prototype.toString.call(rejection);
          stack = (<Error>rejection).stack;
        } else {
          try {
            message = require("pretty-format")(rejection);
          } catch {
            message =
              typeof rejection === "string"
                ? rejection
                : JSON.stringify(rejection);
          }
        }

        const warning =
          `Possible Unhandled Promise Rejection (id: ${id}):\n` +
          `${message ?? ""}\n` +
          (stack == null ? "" : stack);
        console.warn(warning);
      },
      onHandled: (id: number) => {
        const warning =
          `Promise Rejection Handled (id: ${id})\n` +
          "This means you can ignore any previous messages of the form " +
          `"Possible Unhandled Promise Rejection (id: ${id}):"`;
        console.warn(warning);
      },
    });
  }
}

export default RNConsoleDefaultPlugin;
