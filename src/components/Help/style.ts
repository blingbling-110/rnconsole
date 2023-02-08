import StyleSheet from "../../lib/styleSheet";
import { SCREEN_WIDTH } from "../../lib/tool";

export default StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginLeft: 0.35 * SCREEN_WIDTH,
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  iconText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 20,
    textAlign: "center",
  },
  close: {
    backgroundColor: "#ED6A5E",
  },
  maximize: {
    backgroundColor: "#F5BF4F",
  },
  minimize: {
    backgroundColor: "#F5BF4F",
  },
  info: {
    backgroundColor: "#61C554",
  },
  config: {
    backgroundColor: "#5F8AF7",
  },
  help: {
    backgroundColor: "grey",
  },
  desc: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
