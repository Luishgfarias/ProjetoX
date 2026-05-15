import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { FlatList, Text } from "react-native";
import type { LaunchCard } from "../../@types/launch";
import { SEARCH_DEBOUNCE_DELAY_MS } from "../../constants/launchList";
import LaunchListScreen from "../LaunchListScreen";

type MockStoreState = {
  launches: LaunchCard[];
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
  search: string;
  page: number;
  loadInitialLaunches: jest.Mock;
  loadMoreLaunches: jest.Mock;
  refreshLaunches: jest.Mock;
  retryLaunches: jest.Mock;
  setSearch: jest.Mock<Promise<void>, [string]>;
};

let mockStoreState: MockStoreState;

type LaunchListScreenProps = React.ComponentProps<typeof LaunchListScreen>;
type LaunchListNavigation = LaunchListScreenProps["navigation"];
type LaunchListRoute = LaunchListScreenProps["route"];

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const { Text } = require("react-native");

  return function MaterialIconsMock() {
    return <Text>icon</Text>;
  };
});

jest.mock("../../theme/ThemeProvider", () => ({
  useAppTheme: () => ({
    colors: {
      loadingIndicator: "#2563eb",
      searchPlaceholder: "#94a3b8",
      searchClearIcon: "#334155",
      searchIcon: "#ffffff",
      themeSwitchThumb: "#ffffff",
      themeSwitchIcon: "#0f172a",
    },
    isDark: false,
    toggleThemePreference: jest.fn(),
  }),
}));

jest.mock("../../hooks/useDoubleBackExit", () => ({
  useDoubleBackExit: () => ({
    isExitHintVisible: false,
  }),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");

  return {
    SafeAreaView: View,
  };
});

jest.mock("../../store/launchStore", () => ({
  useLaunchStore: Object.assign(
    jest.fn((selector: (state: MockStoreState) => unknown) =>
      selector(mockStoreState),
    ),
    {
      getState: () => mockStoreState,
    },
  ),
}));

function createLaunch(overrides: Partial<LaunchCard> = {}): LaunchCard {
  return {
    id: "launch-1",
    name: "FalconSat",
    flight_number: 1,
    date_utc: "2006-03-24T22:30:00.000Z",
    date_local: "2006-03-25T10:30:00-04:00",
    date_precision: "hour",
    upcoming: false,
    success: true,
    patchImage: null,
    ...overrides,
  };
}

function createStoreState(
  overrides: Partial<MockStoreState> = {},
): MockStoreState {
  return {
    launches: [],
    hasNextPage: false,
    isLoading: false,
    isLoadingMore: false,
    isRefreshing: false,
    error: null,
    search: "",
    page: 1,
    loadInitialLaunches: jest.fn(),
    loadMoreLaunches: jest.fn(),
    refreshLaunches: jest.fn(),
    retryLaunches: jest.fn(),
    setSearch: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderScreen() {
  const navigation = {
    navigate: jest.fn(),
  } as Partial<LaunchListNavigation> as LaunchListNavigation;

  const route: LaunchListRoute = {
    key: "LaunchList-test-route",
    name: "LaunchList",
  };

  render(<LaunchListScreen navigation={navigation} route={route} />);

  return { navigation };
}

describe("LaunchListScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockStoreState = createStoreState();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("exibe loading inicial", () => {
    mockStoreState = createStoreState({
      isLoading: true,
    });

    renderScreen();

    expect(screen.getByText("Carregando lançamentos...")).toBeTruthy();
  });

  it("exibe erro com retry", () => {
    const retryLaunches = jest.fn();
    mockStoreState = createStoreState({
      error: "Falha ao carregar lançamentos.",
      retryLaunches,
    });

    renderScreen();

    expect(screen.getByText("Falha ao carregar lançamentos.")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Tentar novamente"));

    expect(retryLaunches).toHaveBeenCalledTimes(1);
  });

  it("mantem a lista visivel e exibe retry inline quando ha erro apos carregar itens", () => {
    const retryLoadMore = jest.fn();
    mockStoreState = createStoreState({
      launches: [createLaunch()],
      hasNextPage: true,
      error: "Falha ao carregar mais lançamentos.",
      loadMoreLaunches: retryLoadMore,
    });

    renderScreen();

    expect(screen.getByText("FalconSat")).toBeTruthy();
    expect(
      screen.getByText("Falha ao carregar mais lançamentos."),
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Tentar novamente"));

    expect(retryLoadMore).toHaveBeenCalledTimes(1);
  });

  it("exibe estado vazio", () => {
    renderScreen();

    expect(screen.getByText("Ainda não há lançamentos por aqui")).toBeTruthy();
  });

  it("exibe lista de lançamentos", () => {
    mockStoreState = createStoreState({
      launches: [
        createLaunch(),
        createLaunch({ id: "launch-2", name: "Starlink", flight_number: 2 }),
      ],
    });

    renderScreen();

    expect(screen.getByText("FalconSat")).toBeTruthy();
    expect(screen.getByText("Starlink")).toBeTruthy();
  });

  it("filtra por nome", () => {
    const setSearch = jest.fn().mockResolvedValue(undefined);
    mockStoreState = createStoreState({
      setSearch,
    });

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText("Buscar por nome da missão..."),
      "Falcon",
    );

    expect(screen.getByDisplayValue("Falcon")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_DELAY_MS);
    });

    expect(setSearch).toHaveBeenCalledWith("Falcon");
  });

  it("navega para detalhes ao clicar no card", () => {
    mockStoreState = createStoreState({
      launches: [createLaunch()],
    });

    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText("FalconSat"));

    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith("LaunchDetails", {
      id: "launch-1",
    });
  });

  it("executa refresh", () => {
    const refreshLaunches = jest.fn();
    mockStoreState = createStoreState({
      refreshLaunches,
    });

    renderScreen();

    const list = screen.UNSAFE_getByType(FlatList);

    act(() => {
      list.props.refreshControl.props.onRefresh();
    });

    expect(refreshLaunches).toHaveBeenCalledTimes(1);
  });

  it("exibe loading no fim da lista", () => {
    mockStoreState = createStoreState({
      launches: [createLaunch()],
      isLoadingMore: true,
    });

    renderScreen();

    expect(screen.getByText("Carregando mais missões...")).toBeTruthy();
  });
});
