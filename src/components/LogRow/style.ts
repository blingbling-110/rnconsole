import StyleSheet from "../../lib/styleSheet";

export default StyleSheet.create({
  rowWrapper: {
    borderBottomColor: "#A9A9A9",
    borderBottomWidth: 1,
  },
  repeatedWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "darkred",
    position: "absolute",
    top: 4,
    left: 2,
    zIndex: 1, // 否则会被日志文本盖住
    justifyContent: "center",
    alignItems: "center",
  },
  repeated: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  logText: {
    fontSize: 16,
    paddingVertical: 5,
  },
  error: {
    color: "#B22222",
    backgroundColor: "#FFE4E1",
  },
  warn: {
    color: "#FF8C00",
    backgroundColor: "#FFEBCD",
  },
  debug: {
    color: "#1E90FF",
  },
});
