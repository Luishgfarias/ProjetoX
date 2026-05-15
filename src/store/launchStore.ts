import { create } from "zustand";
import { Launch, LaunchCard, LaunchList } from "../@types/launch";
import { LAUNCH_ERROR_MESSAGES } from "../constants/launchMessages";
import { getPaginatedLaunches } from "../services/launchService";
import {
  clearLaunchCache,
  getLaunchPage,
  saveLaunchPage,
} from "../storage/launchStorage";

type LaunchState = {
  launches: LaunchCard[];
  launchDetailsById: Record<string, Launch>;
  page: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
  search: string;
};

type LaunchActions = {
  loadInitialLaunches: () => Promise<void>;
  loadMoreLaunches: () => Promise<void>;
  refreshLaunches: () => Promise<void>;
  retryLaunches: () => Promise<void>;
  setSearch: (value: string) => Promise<void>;
  setLaunchDetail: (launch: Launch) => void;
};

type LaunchStore = LaunchState & LaunchActions;
type LoadingKey = "isLoading" | "isLoadingMore" | "isRefreshing";

const initialState: LaunchState = {
  launches: [],
  launchDetailsById: {},
  page: 1,
  hasNextPage: true,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,
  search: "",
};

export const useLaunchStore = create<LaunchStore>((set, get) => {
  let latestListRequestId = 0;

  const nextListRequestId = () => {
    latestListRequestId += 1;
    return latestListRequestId;
  };

  const isLatestListRequest = (requestId: number) =>
    requestId === latestListRequestId;

  const setListError = (
    requestId: number,
    loadingKey: LoadingKey,
    error: string,
  ) => {
    if (!isLatestListRequest(requestId)) return;

    set({
      error,
      [loadingKey]: false,
    });
  };

  const replaceLaunches = (
    requestId: number,
    response: LaunchList<LaunchCard>,
    loadingKey: LoadingKey,
  ) => {
    if (!isLatestListRequest(requestId)) return;

    set({
      launches: response.docs,
      page: response.page,
      hasNextPage: response.hasNextPage,
      [loadingKey]: false,
    });
  };

  const fetchLaunchPage = async (page: number, search: string) => {
    const response = await getPaginatedLaunches(page, search);
    void saveLaunchPage(page, search, response);
    return response;
  };

  return {
    ...initialState,

    loadInitialLaunches: async () => {
      const requestId = nextListRequestId();
      const { search } = get();
      let hasCachedLaunches = false;

      set({ isLoading: true, error: null });
      try {
        const cachedResponse = await getLaunchPage(1, search);
        if (cachedResponse && isLatestListRequest(requestId)) {
          hasCachedLaunches = true;
          replaceLaunches(requestId, cachedResponse, "isLoading");
        }

        const response = await fetchLaunchPage(1, search);
        replaceLaunches(requestId, response, "isLoading");
      } catch {
        if (hasCachedLaunches) return;
        setListError(requestId, "isLoading", LAUNCH_ERROR_MESSAGES.loadInitial);
      }
    },

    loadMoreLaunches: async () => {
      const {
        page,
        hasNextPage,
        isLoading,
        isLoadingMore,
        isRefreshing,
        error,
        launches,
        search,
      } = get();
      if (
        error ||
        launches.length === 0 ||
        !hasNextPage ||
        isLoading ||
        isLoadingMore ||
        isRefreshing
      )
        return;

      const requestId = nextListRequestId();
      set({ isLoadingMore: true, error: null });
      try {
        const nextPage = page + 1;
        const cachedResponse = await getLaunchPage(nextPage, search);
        if (cachedResponse && isLatestListRequest(requestId)) {
          set((state) => ({
            launches: [...state.launches, ...cachedResponse.docs],
            page: cachedResponse.page,
            hasNextPage: cachedResponse.hasNextPage,
            isLoadingMore: false,
          }));
          return;
        }

        const response = await fetchLaunchPage(nextPage, search);
        if (!isLatestListRequest(requestId) || get().search !== search) return;

        set((state) => ({
          launches: [...state.launches, ...response.docs],
          page: response.page,
          hasNextPage: response.hasNextPage,
          isLoadingMore: false,
        }));
      } catch {
        setListError(
          requestId,
          "isLoadingMore",
          LAUNCH_ERROR_MESSAGES.loadMore,
        );
      }
    },

    refreshLaunches: async () => {
      const requestId = nextListRequestId();
      const { search } = get();

      set({
        isRefreshing: true,
        isLoadingMore: false,
        error: null,
      });

      try {
        await clearLaunchCache();
        const response = await fetchLaunchPage(1, search);
        if (!isLatestListRequest(requestId)) return;

        set({
          launches: response.docs,
          launchDetailsById: {},
          page: 1,
          hasNextPage: response.hasNextPage,
          isRefreshing: false,
        });
      } catch {
        setListError(requestId, "isRefreshing", LAUNCH_ERROR_MESSAGES.refresh);
      }
    },

    retryLaunches: async () => {
      const requestId = nextListRequestId();
      const { page, search } = get();
      let hasCachedLaunches = false;

      set({ isLoading: true, error: null });
      try {
        const cachedResponse = await getLaunchPage(page, search);
        if (cachedResponse && isLatestListRequest(requestId)) {
          hasCachedLaunches = true;
          replaceLaunches(requestId, cachedResponse, "isLoading");
        }

        const response = await fetchLaunchPage(page, search);
        replaceLaunches(requestId, response, "isLoading");
      } catch {
        if (hasCachedLaunches) return;
        setListError(requestId, "isLoading", LAUNCH_ERROR_MESSAGES.retry);
      }
    },

    setSearch: async (value: string) => {
      const requestId = nextListRequestId();
      let hasCachedLaunches = false;

      set({
        search: value,
        page: 1,
        launches: [],
        launchDetailsById: {},
        hasNextPage: true,
        isLoading: true,
        isLoadingMore: false,
        isRefreshing: false,
        error: null,
      });

      try {
        const cachedResponse = await getLaunchPage(1, value);
        if (cachedResponse && isLatestListRequest(requestId)) {
          hasCachedLaunches = true;
          replaceLaunches(requestId, cachedResponse, "isLoading");
        }

        const response = await fetchLaunchPage(1, value);
        replaceLaunches(requestId, response, "isLoading");
      } catch {
        if (hasCachedLaunches) return;
        setListError(requestId, "isLoading", LAUNCH_ERROR_MESSAGES.search);
      }
    },

    setLaunchDetail: (launch: Launch) => {
      set((state) => ({
        launchDetailsById: {
          ...state.launchDetailsById,
          [launch.id]: launch,
        },
      }));
    },
  };
});
