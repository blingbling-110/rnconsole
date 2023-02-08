import { RNConsoleNetworkRequestItem } from "./requestItem";
import { proxy, useSnapshot } from "valtio";

/**
 * Network Store
 */
export const rnConsoleNetworkStore = proxy<{
  [id: string]: RNConsoleNetworkRequestItem;
}>({});

export const useRNConsoleNetworkStore = () =>
  useSnapshot(rnConsoleNetworkStore);
