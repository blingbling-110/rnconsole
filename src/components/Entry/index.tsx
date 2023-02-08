import React, { memo, useCallback, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import style from "./style";
import { RNConsole } from "../../core";
import { useRNConsoleStore } from "../../core/store";

const Entry = ({ withCloseButton }: { withCloseButton?: boolean }) => {
  const { showSwitchButton } = useRNConsoleStore();

  const close = useCallback(() => RNConsole.instance?.hideSwitch(), []);

  useEffect(() => {
    !withCloseButton && RNConsole.instance?.showSwitch()
  }, [withCloseButton])

  return (
    <View
      style={[
        style.entryWrapper,
        showSwitchButton
          ? { display: "flex", position: "absolute" }
          : { display: "none", position: "relative" },
      ]}
    >
      {withCloseButton && (
        <TouchableOpacity style={style.entryClose} onPress={close}>
          <Text style={style.close}>X</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={style.entryIcon}
        onPress={() => RNConsole.instance?.show()}
      >
        <Text style={style.icon}>RN</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(Entry);
