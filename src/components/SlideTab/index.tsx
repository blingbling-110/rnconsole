import React, {
  Key,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  LayoutChangeEvent,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import style from "./style";

export interface SlideTabItem {
  label: string;
  key: Key;
}

export interface SlideTabProps {
  items: SlideTabItem[];
  activeKey?: SlideTabItem["key"];
  onChange?: (item: SlideTabItem) => void;
  wrapperStyle?: ViewStyle;
  labelStyle?: TextStyle;
  actLabelStyle?: ViewStyle;
}

const SlideTab = (props: SlideTabProps) => {
  const {
    items,
    activeKey,
    onChange,
    wrapperStyle,
    labelStyle,
    actLabelStyle,
  } = props;
  const [actKey, setActKey] = useState<SlideTabItem["key"]>();
  const [actPos, setActPos] = useState(0);
  const [actWidth, setActWidth] = useState(0);

  const posAndWidth = useRef(new Map()).current;
  const pos = useRef(new Animated.Value(0)).current;
  const width = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(
    (item: SlideTabItem) => {
      setActKey(item.key);
      if (onChange) {
        onChange(item);
      }
    },
    [onChange]
  );
  const handleLayout = useCallback(
    (evt: LayoutChangeEvent, key: SlideTabItem["key"]) => {
      const { x, width } = evt.nativeEvent.layout;
      posAndWidth.set(key, { x, width });
      if (key === activeKey) {
        setActPos(x);
        setActWidth(width);
      }
    },
    [activeKey, posAndWidth]
  );

  useEffect(() => {
    setActKey(activeKey);
  }, [activeKey]);
  useEffect(() => {
    setActPos(posAndWidth.get(actKey)?.x);
    setActWidth(posAndWidth.get(actKey)?.width);
  }, [actKey, posAndWidth]);
  useEffect(() => {
    if (actPos || actPos === 0) {
      Animated.timing(pos, {
        toValue: actPos,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [actPos, pos]);
  useEffect(() => {
    if (actWidth || actWidth === 0) {
      Animated.timing(width, {
        toValue: actWidth,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [actWidth, width]);

  return (
    <View style={[style.wrapper, wrapperStyle]}>
      <Animated.View style={[style.actPanel, { left: pos, width }]} />
      {items.map((item) => (
        <TouchableOpacity
          accessibilityLabel={"e93335c4"}
          key={item.key as Key}
          onPress={() => handlePress(item)}
          onLayout={(evt: LayoutChangeEvent) => handleLayout(evt, item.key)}
        >
          <Text
            style={[
              style.label,
              labelStyle,
              actKey === item.key && style.actLabel,
              actKey === item.key && actLabelStyle,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default memo(SlideTab);
