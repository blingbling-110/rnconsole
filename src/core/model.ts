import { coreStore } from "./store";

export const contentStore = {
  updateTime: () => (coreStore.updateTime = Date.now()),
};
