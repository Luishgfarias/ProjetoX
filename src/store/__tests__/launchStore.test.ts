import { act } from "@testing-library/react-native";
import type { Launch, LaunchCard, LaunchList } from "../../@types/launch";
import { LAUNCH_ERROR_MESSAGES } from "../../constants/launchMessages";
import { useLaunchStore } from "../launchStore";

jest.mock("../../services/launchService", () => ({
  getPaginatedLaunches: jest.fn(),
}));

jest.mock("../../storage/launchStorage", () => ({
  clearLaunchCache: jest.fn(),
  getLaunchPage: jest.fn(),
  saveLaunchPage: jest.fn(),
}));

import { getPaginatedLaunches } from "../../services/launchService";
import {
  clearLaunchCache,
  getLaunchPage,
  saveLaunchPage,
} from "../../storage/launchStorage";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error?: unknown) => void;
};

const mockedGetPaginatedLaunches = jest.mocked(getPaginatedLaunches);
const mockedClearLaunchCache = jest.mocked(clearLaunchCache);
const mockedGetLaunchPage = jest.mocked(getLaunchPage);
const mockedSaveLaunchPage = jest.mocked(saveLaunchPage);

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function createLaunchCard(
  overrides: Partial<LaunchCard> = {},
): LaunchCard {
  return {
    id: "launch-1",
    name: "FalconSat",
    flight_number: 1,
    date_utc: "2006-03-24T22:30:00.000Z",
    date_local: "2006-03-25T10:30:00-04:00",
    date_precision: "hour",
    upcoming: false,
    success: false,
    patchImage: "https://images.example.com/falconsat.png",
    ...overrides,
  };
}

function createLaunchDetail(overrides: Partial<Launch> = {}): Launch {
  return {
    id: "launch-1",
    name: "FalconSat",
    flight_number: 1,
    rocket: "rocket-1",
    payloads: [],
    launchpad: "launchpad-1",
    upcoming: false,
    success: false,
    details: null,
    date_utc: "2006-03-24T22:30:00.000Z",
    date_unix: 1143239400,
    date_local: "2006-03-25T10:30:00-04:00",
    date_precision: "hour",
    static_fire_date_utc: null,
    static_fire_date_unix: null,
    net: false,
    window: null,
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
        small: null,
        large: null,
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

function createLaunchList(
  docs: LaunchCard[],
  overrides: Partial<LaunchList<LaunchCard>> = {},
): LaunchList<LaunchCard> {
  return {
    docs,
    totalDocs: docs.length,
    limit: 10,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
    ...overrides,
  };
}

function resetLaunchStore() {
  useLaunchStore.setState({
    launches: [],
    launchDetailsById: {},
    page: 1,
    hasNextPage: true,
    isLoading: false,
    isLoadingMore: false,
    isRefreshing: false,
    error: null,
    search: "",
  });
}

describe("launchStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetLaunchStore();
    mockedGetLaunchPage.mockResolvedValue(null);
    mockedClearLaunchCache.mockResolvedValue(undefined);
    mockedSaveLaunchPage.mockResolvedValue(undefined);
  });

  it("controla o loading inicial antes de concluir a primeira busca", async () => {
    const response = createLaunchList([createLaunchCard()]);
    const deferred = createDeferred<LaunchList<LaunchCard>>();
    mockedGetPaginatedLaunches.mockReturnValueOnce(deferred.promise);

    await act(async () => {
      const promise = useLaunchStore.getState().loadInitialLaunches();
      await Promise.resolve();

      expect(useLaunchStore.getState()).toMatchObject({
        isLoading: true,
        error: null,
        launches: [],
        page: 1,
        hasNextPage: true,
      });

      deferred.resolve(response);
      await promise;
    });

    expect(useLaunchStore.getState()).toMatchObject({
      launches: response.docs,
      page: 1,
      hasNextPage: false,
      isLoading: false,
      error: null,
    });
  });

  it("carrega a primeira pagina com sucesso", async () => {
    const response = createLaunchList(
      [createLaunchCard(), createLaunchCard({ id: "launch-2", name: "Crew-1" })],
      { hasNextPage: true, totalDocs: 2, totalPages: 2 },
    );
    mockedGetPaginatedLaunches.mockResolvedValueOnce(response);

    await act(async () => {
      await useLaunchStore.getState().loadInitialLaunches();
    });

    expect(mockedGetLaunchPage).toHaveBeenCalledWith(1, "");
    expect(mockedGetPaginatedLaunches).toHaveBeenCalledWith(1, "");
    expect(mockedSaveLaunchPage).toHaveBeenCalledWith(1, "", response);
    expect(useLaunchStore.getState()).toMatchObject({
      launches: response.docs,
      page: 1,
      hasNextPage: true,
      isLoading: false,
      error: null,
    });
  });

  it("guarda erro ao falhar no carregamento inicial", async () => {
    mockedGetPaginatedLaunches.mockRejectedValueOnce(new Error("Falha"));

    await act(async () => {
      await useLaunchStore.getState().loadInitialLaunches();
    });

    expect(useLaunchStore.getState()).toMatchObject({
      launches: [],
      isLoading: false,
      error: LAUNCH_ERROR_MESSAGES.loadInitial,
    });
  });

  it("permite retry reaproveitando a pagina atual", async () => {
    const response = createLaunchList(
      [createLaunchCard({ id: "launch-3", name: "Transporter-1" })],
      { page: 2, hasPrevPage: true, prevPage: 1, totalPages: 3, hasNextPage: true },
    );
    const deferred = createDeferred<LaunchList<LaunchCard>>();
    mockedGetPaginatedLaunches.mockReturnValueOnce(deferred.promise);

    useLaunchStore.setState({
      page: 2,
      error: LAUNCH_ERROR_MESSAGES.loadInitial,
    });

    await act(async () => {
      const promise = useLaunchStore.getState().retryLaunches();
      await Promise.resolve();

      expect(useLaunchStore.getState()).toMatchObject({
        isLoading: true,
        error: null,
        page: 2,
      });
      expect(mockedGetLaunchPage).toHaveBeenCalledWith(2, "");
      expect(mockedGetPaginatedLaunches).toHaveBeenCalledWith(2, "");

      deferred.resolve(response);
      await promise;
    });

    expect(useLaunchStore.getState()).toMatchObject({
      launches: response.docs,
      page: 2,
      hasNextPage: true,
      isLoading: false,
      error: null,
    });
  });

  it("carrega mais itens e concatena a proxima pagina", async () => {
    const currentLaunch = createLaunchCard();
    const nextLaunch = createLaunchCard({ id: "launch-2", name: "Starlink" });
    const response = createLaunchList([nextLaunch], {
      page: 2,
      hasPrevPage: true,
      hasNextPage: false,
      prevPage: 1,
      totalPages: 2,
    });
    const deferred = createDeferred<LaunchList<LaunchCard>>();
    mockedGetPaginatedLaunches.mockReturnValueOnce(deferred.promise);

    useLaunchStore.setState({
      launches: [currentLaunch],
      page: 1,
      hasNextPage: true,
    });

    await act(async () => {
      const promise = useLaunchStore.getState().loadMoreLaunches();
      await Promise.resolve();

      expect(useLaunchStore.getState()).toMatchObject({
        isLoadingMore: true,
        error: null,
        launches: [currentLaunch],
        page: 1,
      });
      expect(mockedGetLaunchPage).toHaveBeenCalledWith(2, "");
      expect(mockedGetPaginatedLaunches).toHaveBeenCalledWith(2, "");

      deferred.resolve(response);
      await promise;
    });

    expect(useLaunchStore.getState()).toMatchObject({
      launches: [currentLaunch, nextLaunch],
      page: 2,
      hasNextPage: false,
      isLoadingMore: false,
      error: null,
    });
  });

  it("faz refresh limpando cache e resetando detalhes em memoria", async () => {
    const refreshedLaunch = createLaunchCard({
      id: "launch-9",
      name: "CRS-21",
    });
    const response = createLaunchList([refreshedLaunch], {
      hasNextPage: true,
      totalPages: 4,
    });
    const deferred = createDeferred<LaunchList<LaunchCard>>();
    mockedGetPaginatedLaunches.mockReturnValueOnce(deferred.promise);

    useLaunchStore.setState({
      launches: [createLaunchCard()],
      launchDetailsById: {
        "launch-1": createLaunchDetail(),
      },
      page: 3,
      hasNextPage: false,
      isLoadingMore: true,
      error: LAUNCH_ERROR_MESSAGES.loadMore,
    });

    await act(async () => {
      const promise = useLaunchStore.getState().refreshLaunches();
      await Promise.resolve();

      expect(useLaunchStore.getState()).toMatchObject({
        isRefreshing: true,
        isLoadingMore: false,
        error: null,
        page: 3,
      });
      expect(mockedClearLaunchCache).toHaveBeenCalledTimes(1);
      expect(mockedGetPaginatedLaunches).toHaveBeenCalledWith(1, "");

      deferred.resolve(response);
      await promise;
    });

    expect(useLaunchStore.getState()).toMatchObject({
      launches: [refreshedLaunch],
      launchDetailsById: {},
      page: 1,
      hasNextPage: true,
      isRefreshing: false,
      error: null,
    });
  });

  it("busca por nome resetando a lista e aplicando o resultado filtrado", async () => {
    const filteredLaunch = createLaunchCard({
      id: "launch-7",
      name: "Falcon Heavy Test Flight",
    });
    const response = createLaunchList([filteredLaunch], {
      totalDocs: 1,
      hasNextPage: false,
    });
    const deferred = createDeferred<LaunchList<LaunchCard>>();
    mockedGetPaginatedLaunches.mockReturnValueOnce(deferred.promise);

    useLaunchStore.setState({
      launches: [createLaunchCard({ id: "launch-old", name: "Legacy" })],
      page: 4,
      launchDetailsById: {
        "launch-old": createLaunchDetail({
          id: "launch-old",
          name: "Legacy",
        }),
      },
      hasNextPage: false,
      error: LAUNCH_ERROR_MESSAGES.loadInitial,
    });

    await act(async () => {
      const promise = useLaunchStore.getState().setSearch("Falcon");
      await Promise.resolve();

      expect(useLaunchStore.getState()).toMatchObject({
        search: "Falcon",
        launches: [],
        launchDetailsById: {},
        page: 1,
        hasNextPage: true,
        isLoading: true,
        isLoadingMore: false,
        isRefreshing: false,
        error: null,
      });
      expect(mockedGetLaunchPage).toHaveBeenCalledWith(1, "Falcon");
      expect(mockedGetPaginatedLaunches).toHaveBeenCalledWith(1, "Falcon");

      deferred.resolve(response);
      await promise;
    });

    expect(useLaunchStore.getState()).toMatchObject({
      search: "Falcon",
      launches: [filteredLaunch],
      page: 1,
      hasNextPage: false,
      isLoading: false,
      error: null,
    });
  });
});
