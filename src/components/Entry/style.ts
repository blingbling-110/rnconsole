import StyleSheet from "../../lib/styleSheet";

export default StyleSheet.create({
  entryWrapper: {
    width: 40,
    height: 40,
    bottom: 150,
    left: 0,
    zIndex: 90000,
  },
  entryClose: {
    width: 16,
    height: 16,
    marginLeft: 24,
    backgroundColor: "#7A7A7A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  close: {
    color: "white",
    fontSize: 10,
  },
  entryIcon: {
    width: 30,
    height: 30,
    backgroundColor: "#FF8800",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: "white",
    fontWeight: "bold",
  },
});
