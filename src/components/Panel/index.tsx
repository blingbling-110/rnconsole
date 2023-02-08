import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import SlideTab, { SlideTabItem } from "../SlideTab";
import style from "./style";
import { RNConsole } from "../../core";
import { useRNConsoleStore } from "../../core/store";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATE_BAR_HEIGHT } from "../../lib/tool";
import SystemInfo from "../SystemInfo";
import Config from "../Config";
import Help from "../Help";

export const ICONS = [
  {
    name: 'close',
    icon: 'X',
    desc: '隐藏面板',
  },
  {
    name: 'maximize',
    icon: '口',
    desc: '最大化面板',
  },
  {
    name: 'minimize',
    icon: '一',
    desc: '最小化面板',
  },
  {
    name: 'info',
    icon: 'i',
    desc: '打开系统信息页',
  },
  {
    name: 'config',
    icon: '≡',
    desc: '打开设置页',
  },
  {
    name: 'help',
    icon: '?',
    desc: '打开帮助页',
  },
]

const Panel = () => {
  const [curTabKey, setCurTabKey] = useState<SlideTabItem["key"]>("default");
  const [isMax, setIsMax] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [keyboardPosition, setKeyboardPosition] = useState(0)
  const { show, pluginList } = useRNConsoleStore();

  const plugins = useMemo(() =>
    Object.values(pluginList).filter(({ hasTabPanel }) => hasTabPanel),
    [pluginList])

  const getCallback = useCallback((name: string) => {
    switch (name) {
      case 'close':
        return () => RNConsole.instance?.hide()
      case 'maximize':
        return () => setIsMax(!isMax)
      case 'info':
        return () => setShowSystemInfo(true)
      case 'config':
        return () => setShowConfig(true)
      case 'help':
        return () => setShowHelp(true)
      default:
        break;
    }
  }, [isMax])

  const onChange = useCallback((item: SlideTabItem) => {
    setCurTabKey(item.key)
    RNConsole.instance?.showPlugin(item.key as string)
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }
    const showHandler = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardPosition(event.endCoordinates.height)
    })
    const hideHandler = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardPosition(0)
    })
    return () => {
      showHandler.remove()
      hideHandler.remove()
    }
  }, [])

  return (
    <>
      <SafeAreaView
        style={[
          style.mainWrapper,
          show
            ? { display: "flex", position: "absolute" }
            : { display: "none", position: "relative" },
          {
            height: isMax ?
              (SCREEN_HEIGHT - (Platform.OS === 'android' ? STATE_BAR_HEIGHT : 0)) :
              (SCREEN_HEIGHT / 2),
            bottom: isMax ? -keyboardPosition : 0
          }
        ]}
      >
        <View style={style.iconPanel}>
          {ICONS.filter(({ name }) => name !== 'minimize').map(({ name, icon }) =>
            <TouchableOpacity key={name} style={[style.icon, style[name]]} onPress={getCallback(name)}>
              <Text style={style.iconText}>
                {(name === 'maximize' && isMax) ? ICONS.filter(({ name }) => name === 'minimize')[0].icon : icon}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={style.version}>RNConsole {RNConsole.instance?.version}</Text>
        </View>
        <SlideTab
          items={plugins.map(({ id, name }) => ({ key: id, label: name }))}
          activeKey={curTabKey}
          onChange={onChange}
          wrapperStyle={style.tabs}
          labelStyle={{ width: SCREEN_WIDTH / plugins.length }}
        />
        {plugins.map(({ id, tabComponent: TabComponent }) =>
          <View style={{ flex: 1, display: curTabKey === id ? "flex" : "none" }} key={id}>
            <TabComponent />
          </View>)}
      </SafeAreaView>
      {showSystemInfo && <SystemInfo setShowSystemInfo={setShowSystemInfo} />}
      {showConfig && <Config setShowConfig={setShowConfig} />}
      {showHelp && <Help setShowHelp={setShowHelp} />}
    </>
  );
};

export default memo(Panel);
