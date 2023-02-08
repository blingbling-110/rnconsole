// 为了自动提示引入
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
export type StyleProps = Partial<ViewStyle | TextStyle | ImageStyle>;
export default {
  create(styles: { [className: string]: StyleProps }) {
    return StyleSheet.create(styles);
  },
};
