import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { LaunchCard } from "../LaunchCard";

type LaunchCardProps = React.ComponentProps<typeof LaunchCard>;
type LaunchData = LaunchCardProps["launch"];

function createLaunch(overrides: Partial<LaunchData> = {}): LaunchData {
  return {
    id: "launch-1",
    name: "FalconSat",
    flight_number: 1,
    date_utc: "2006-03-24T22:30:00.000Z",
    date_local: "2006-03-25T10:30:00-04:00",
    upcoming: false,
    success: true,
    patchImage: null,
    ...overrides,
  };
}

describe("LaunchCard", () => {
  it("renderiza o nome da missao", () => {
    render(<LaunchCard launch={createLaunch()} onPress={jest.fn()} />);

    expect(screen.getByText("FalconSat")).toBeTruthy();
  });

  it("renderiza o numero do voo", () => {
    render(<LaunchCard launch={createLaunch()} onPress={jest.fn()} />);

    expect(screen.getByText("Voo #1")).toBeTruthy();
  });

  it.each([
    {
      launch: createLaunch({ upcoming: true, success: null }),
      expectedStatus: "Agendado",
    },
    {
      launch: createLaunch({ upcoming: false, success: true }),
      expectedStatus: "Sucesso",
    },
    {
      launch: createLaunch({ upcoming: false, success: false }),
      expectedStatus: "Falha",
    },
  ])("renderiza o status correto: $expectedStatus", ({ launch, expectedStatus }) => {
    render(<LaunchCard launch={launch} onPress={jest.fn()} />);

    expect(screen.getByText(expectedStatus)).toBeTruthy();
  });

  it("chama onPress com o ID correto", () => {
    const onPress = jest.fn();

    render(<LaunchCard launch={createLaunch()} onPress={onPress} />);

    fireEvent.press(screen.getByText("FalconSat"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith("launch-1");
  });

  it("renderiza imagem quando existir", () => {
    const patchImage = "https://images.example.com/patch.png";

    render(
      <LaunchCard
        launch={createLaunch({ patchImage })}
        onPress={jest.fn()}
      />,
    );

    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({
      uri: patchImage,
    });
  });

  it("aplica fallback visual quando patchImage for null", () => {
    render(<LaunchCard launch={createLaunch()} onPress={jest.fn()} />);

    expect(screen.UNSAFE_getByType(Image).props.source).toMatchObject({
      testUri: expect.stringContaining("noMissionImage.png"),
    });
  });
});
