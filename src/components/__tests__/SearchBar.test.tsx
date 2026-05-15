import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SearchBar } from "../SearchBar";

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const { Text } = require("react-native");

  return function MaterialIconsMock() {
    return <Text>icon</Text>;
  };
});

jest.mock("../../theme/ThemeProvider", () => ({
  useAppTheme: () => ({
    colors: {
      searchPlaceholder: "#94a3b8",
      searchClearIcon: "#334155",
      searchIcon: "#ffffff",
    },
  }),
}));

describe("SearchBar", () => {
  it("renderiza o placeholder", () => {
    render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        placeholder="Buscar missao"
      />,
    );

    expect(screen.getByPlaceholderText("Buscar missao")).toBeTruthy();
  });

  it("renderiza o valor atual", () => {
    render(<SearchBar value="Falcon 9" onChangeText={jest.fn()} />);

    expect(screen.getByDisplayValue("Falcon 9")).toBeTruthy();
  });

  it("chama onChangeText", () => {
    const onChangeText = jest.fn();

    render(<SearchBar value="" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByPlaceholderText("Buscar..."), "Starlink");

    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith("Starlink");
  });

  it("aceita texto vazio", () => {
    const onChangeText = jest.fn();

    render(<SearchBar value="" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByPlaceholderText("Buscar..."), "");

    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith("");
  });
});
