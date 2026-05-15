import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import type { Launch } from "../../@types/launch";
import LaunchDetailsScreen from "../LaunchDetailsScreen";

type UseLaunchDetailsResult = {
  launch: Launch | null;
  loading: boolean;
  error: string | null;
  emptyMessage: string | null;
  fetchLaunch: jest.Mock;
};

let mockUseLaunchDetailsResult: UseLaunchDetailsResult;

type LaunchDetailsScreenProps = React.ComponentProps<typeof LaunchDetailsScreen>;
type LaunchDetailsNavigation = LaunchDetailsScreenProps["navigation"];
type LaunchDetailsRoute = LaunchDetailsScreenProps["route"];

jest.mock("../../components/LaunchVideoPlayer", () => ({
  LaunchVideoPlayer: ({ videoUrl }: { videoUrl?: Launch["links"]["webcast"] }) => {
    const { Text } = require("react-native");

    return videoUrl ? <Text>video:{JSON.stringify(videoUrl)}</Text> : null;
  },
}));

jest.mock("../../hooks/useLaunchDetails", () => ({
  useLaunchDetails: jest.fn(() => mockUseLaunchDetailsResult),
}));

function createLaunch(overrides: Partial<Launch> = {}): Launch {
  return {
    id: "launch-1",
    name: "FalconSat",
    flight_number: 1,
    rocket: "falcon-1",
    payloads: ["payload-1"],
    launchpad: "kwajalein",
    upcoming: false,
    success: true,
    details: "Primeiro voo de demonstração.",
    date_utc: "2006-03-24T22:30:00.000Z",
    date_unix: 1143239400,
    date_local: "2006-03-25T10:30:00-04:00",
    date_precision: "hour",
    static_fire_date_utc: null,
    static_fire_date_unix: null,
    net: false,
    window: 0,
    tbd: false,
    crew: [],
    ships: [],
    capsules: [],
    fairings: {
      reused: null,
      recovery_attempt: null,
      recovered: null,
      ships: [],
    },
    links: {
      patch: {
        small: "https://images.example.com/patch-small.png",
        large: "https://images.example.com/patch-large.png",
      },
      reddit: {
        campaign: null,
        launch: null,
        media: null,
        recovery: null,
      },
      flickr: {
        small: [],
        original: [],
      },
      presskit: null,
      webcast: null,
      youtube_id: null,
      article: null,
      wikipedia: null,
    },
    failures: [],
    cores: [],
    auto_update: true,
    launch_library_id: null,
    ...overrides,
  };
}

function renderScreen() {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as Partial<LaunchDetailsNavigation> as LaunchDetailsNavigation;

  const route: LaunchDetailsRoute = {
    key: "LaunchDetails-test-route",
    name: "LaunchDetails",
    params: {
      id: "launch-1",
    },
  };

  render(<LaunchDetailsScreen navigation={navigation} route={route} />);

  return { navigation };
}

describe("LaunchDetailsScreen", () => {
  beforeEach(() => {
    mockUseLaunchDetailsResult = {
      launch: createLaunch(),
      loading: false,
      error: null,
      emptyMessage: null,
      fetchLaunch: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exibe dados do lançamento", () => {
    renderScreen();

    expect(screen.getByText("FalconSat")).toBeTruthy();
    expect(screen.getByText("Voo #1")).toBeTruthy();
    expect(screen.getAllByText("Sucesso").length).toBeGreaterThan(0);
    expect(screen.getByText("Primeiro voo de demonstração.")).toBeTruthy();
  });

  it("trata ausência de detalhes", () => {
    mockUseLaunchDetailsResult = {
      ...mockUseLaunchDetailsResult,
      launch: createLaunch({
        details: null,
      }),
    };

    renderScreen();

    expect(screen.getByText("Sem detalhes disponíveis.")).toBeTruthy();
  });

  it("aplica fallback visual quando patch small e large forem null", () => {
    mockUseLaunchDetailsResult = {
      ...mockUseLaunchDetailsResult,
      launch: createLaunch({
        links: {
          ...createLaunch().links,
          patch: {
            small: null,
            large: null,
          },
        },
      }),
    };

    renderScreen();

    expect(screen.UNSAFE_getByType(Image).props.source).toMatchObject({
      testUri: expect.stringContaining("noMissionImage.png"),
    });
  });

  it("mostra fallback para data de queima estática quando vier nula", () => {
    renderScreen();

    expect(screen.getByText("Queima estática (UTC)")).toBeTruthy();
    expect(screen.getAllByText("Não informado").length).toBeGreaterThan(0);
  });

  it("exibe datas formatadas de forma amigavel", () => {
    renderScreen();

    expect(screen.getByText("25/03/2006 às 10:30")).toBeTruthy();
    expect(screen.getByText("24/03/2006 às 22:30 UTC")).toBeTruthy();
  });

  it("mostra botão de artigo quando houver link", () => {
    mockUseLaunchDetailsResult = {
      ...mockUseLaunchDetailsResult,
      launch: createLaunch({
        links: {
          ...createLaunch().links,
          article: "https://example.com/article",
        },
      }),
    };

    const { navigation } = renderScreen();

    expect(screen.getByLabelText("Ler artigo")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ler artigo"));

    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith("ArticleWebView", {
      url: "https://example.com/article",
      title: "FalconSat",
    });
  });

  it("esconde botão quando artigo for null", () => {
    renderScreen();

    expect(screen.queryByLabelText("Ler artigo")).toBeNull();
  });

  it("mostra player de vídeo quando houver webcast", () => {
    mockUseLaunchDetailsResult = {
      ...mockUseLaunchDetailsResult,
      launch: createLaunch({
        links: {
          ...createLaunch().links,
          webcast: "https://youtube.com/watch?v=abc123",
        },
      }),
    };

    renderScreen();

    expect(
      screen.getByText('video:"https://youtube.com/watch?v=abc123"'),
    ).toBeTruthy();
  });

  it("não quebra quando webcast for null", () => {
    renderScreen();

    expect(screen.queryByText(/video:/)).toBeNull();
    expect(screen.getByText("Links úteis")).toBeTruthy();
  });

  it("lida com fairings nulo e arrays vazios ou nulos", () => {
    mockUseLaunchDetailsResult = {
      ...mockUseLaunchDetailsResult,
      launch: createLaunch({
        fairings: null,
        failures: null,
        cores: null,
      }),
    };

    renderScreen();

    expect(screen.getByText("Nenhum core informado")).toBeTruthy();
    expect(screen.getByText("Nenhuma falha registrada")).toBeTruthy();
    expect(screen.getByText("Coifa")).toBeTruthy();
  });
});
