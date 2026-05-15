import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renderiza a mensagem e dispara as acoes", () => {
    const onRetry = jest.fn();
    const onBack = jest.fn();

    render(
      <ErrorState
        message="Falha ao carregar dados"
        onRetry={onRetry}
        onBack={onBack}
      />,
    );

    expect(screen.getByText("Falha ao carregar dados")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Tentar novamente"));
    fireEvent.press(screen.getByLabelText("Voltar"));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
