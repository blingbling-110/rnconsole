import { Platform } from "react-native";
import {
  getApiLevel,
  getApplicationName,
  getBrand,
  getBuildId,
  getBundleId,
  getDeviceName,
  getFirstInstallTime,
  getIpAddress,
  getLastUpdateTime,
  getMacAddress,
  getMaxMemory,
  getReadableVersion,
  getSystemName,
  getSystemVersion,
  getTotalMemory,
  getUserAgent,
} from "react-native-device-info";
import { getBytesText, getDate } from "../lib/tool";
import { RNConsoleLogPlugin } from ".";
import { RNConsoleLogStore } from "./store";

const convertDate = (timestamp: number) => {
  const { year, month, day, hour, minute, second } = getDate(timestamp);
  return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
};

export class RNConsoleSystemPlugin extends RNConsoleLogPlugin {
  public onReady() {
    super.onReady();
    this.printSystemInfo();
  }

  public async printSystemInfo() {
    const firstInstallTime = convertDate(await getFirstInstallTime());
    const lastUpdateTime = convertDate(await getLastUpdateTime());
    const { systemInfo } = RNConsoleLogStore.get("system");
    if (!systemInfo) {
      console.error("RNConsole system plugin error");
      return;
    }
    // print system info
    systemInfo.deviceName = {
      key: "设备名称",
      value: await getDeviceName(),
    };
    systemInfo.brand = {
      key: "设备品牌",
      value: getBrand(),
    };
    systemInfo.totalMemory = {
      key: "设备内存",
      value: getBytesText(await getTotalMemory()),
    };
    if (Platform.OS === "android") {
      systemInfo.maxMemory = {
        key: "VM最大内存",
        value: getBytesText(await getMaxMemory()),
      };
    }
    systemInfo.system = {
      key: "操作系统",
      value: `${getSystemName()} ${getSystemVersion()} (构建ID: ${await getBuildId()})`,
    };
    if (Platform.OS === "android") {
      systemInfo.apiLevel = {
        key: "安卓API级别",
        value: `${await getApiLevel()}`,
      };
    }
    systemInfo.ipAddress = {
      key: "IP地址",
      value: `${await getIpAddress()}`,
    };
    systemInfo.macAddress = {
      key: "MAC地址",
      value: `${await getMacAddress()}`,
    };
    systemInfo.userAgent = {
      key: "User Agent",
      value: await getUserAgent(),
    };
    systemInfo.applicationName = {
      key: "应用名称",
      value: getApplicationName(),
    };
    systemInfo.readableVersion = {
      key: "应用版本",
      value: getReadableVersion(),
    };
    systemInfo.bundleId = {
      key: "应用包ID",
      value: getBundleId(),
    };
    systemInfo.firstInstallTime = {
      key: "首次安装时间",
      value: firstInstallTime,
    };
    if (Platform.OS === "android") {
      systemInfo.lastUpdateTime = {
        key: "最后更新时间",
        value: lastUpdateTime,
      };
    }
  }

  // 继承了RNConsoleLogPlugin但不需要面板
  public onRenderTab(): void {}
}

export default RNConsoleSystemPlugin;
