import { Platform } from "react-native";
import StyleSheet from "../../lib/styleSheet";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  NAVIGATION_HEIGHT,
  STATE_BAR_HEIGHT,
} from "./../../lib/tool";

export default StyleSheet.create({
  wrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - (Platform.OS === "android" ? STATE_BAR_HEIGHT : 0),
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 90002,
    backgroundColor: "white",
  },
  top: {
    width: SCREEN_WIDTH,
    height: NAVIGATION_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "rgba(0,0,0,.9)",
    fontSize: 17,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  closeWrapper: {
    width: 30,
    height: 30,
    position: "absolute",
    top: 5,
    left: 10,
  },
  close: {
    color: "red",
    fontSize: 25,
    fontWeight: "bold",
    lineHeight: 30,
    textAlign: "center",
  },
});
