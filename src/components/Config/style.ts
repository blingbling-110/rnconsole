import StyleSheet from "../../lib/styleSheet";

export default StyleSheet.create({
  wrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  label: {
    color: "#EE8131",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "40%",
    height: 30,
    borderWidth: 1,
    borderColor: "#AAAAAA",
    borderRadius: 4,
    paddingHorizontal: 15,
  },
  button: {
    fontSize: 18,
  },
});
