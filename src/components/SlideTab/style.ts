import StyleSheet from "../../lib/styleSheet";

export default StyleSheet.create({
  wrapper: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    borderRadius: 22,
  },
  label: {
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 40,
    color: "#999999",
    textAlign: "center",
  },
  actLabel: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actPanel: {
    height: "100%",
    position: "absolute",
    borderRadius: 22,
    backgroundColor: "#FF9142",
  },
});
