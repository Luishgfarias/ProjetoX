import { create } from 'zustand';
import { LaunchCard } from '../@types/launch';
import { getPaginatedLaunches } from '../services/launchService';
import { clearLaunchCache } from '../storage/launchStorage';
import { mapLaunchToCard } from '../utils/mapLaunchToCard';

type LaunchState = {
  launches: LaunchCard[];
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
};

type LaunchStore = LaunchState & LaunchActions;

const initialState: LaunchState = {
  launches: [],
  page: 1,
  hasNextPage: true,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,
  search: '',
};

export const useLaunchStore = create<LaunchStore>((set, get) => {
  let latestListRequestId = 0;

  const nextListRequestId = () => {
    latestListRequestId += 1;
    return latestListRequestId;
  };

  const isLatestListRequest = (requestId: number) =>
    requestId === latestListRequestId;

  return {
    ...initialState,

    loadInitialLaunches: async () => {
      const requestId = nextListRequestId();
      const { search } = get();

      set({ isLoading: true, error: null });
      try {
        const response = await getPaginatedLaunches(1, search);
        if (!isLatestListRequest(requestId)) return;

        const launches = response.docs.map(mapLaunchToCard);
        set({
          launches,
          page: 1,
          hasNextPage: response.hasNextPage,
          isLoading: false,
        });
      } catch {
        if (!isLatestListRequest(requestId)) return;

        set({
          error: 'Falha ao carregar lançamentos.',
          isLoading: false,
        });
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
      ) return;

      set({ isLoadingMore: true, error: null });
      try {
        const nextPage = page + 1;
        const response = await getPaginatedLaunches(nextPage, search);
        if (get().search !== search) return;

        const newLaunches = response.docs.map(mapLaunchToCard);
        set((state) => ({
          launches: [...state.launches, ...newLaunches],
          page: nextPage,
          hasNextPage: response.hasNextPage,
          isLoadingMore: false,
        }));
      } catch {
        if (get().search !== search) return;

        set({
          error: 'Falha ao carregar mais lançamentos.',
          isLoadingMore: false,
        });
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
        const response = await getPaginatedLaunches(1, search);
        if (!isLatestListRequest(requestId)) return;

        const launches = response.docs.map(mapLaunchToCard);
        set({
          launches,
          page: 1,
          hasNextPage: response.hasNextPage,
          isRefreshing: false,
        });
      } catch {
        if (!isLatestListRequest(requestId)) return;

        set({
          error: 'Falha ao atualizar lançamentos.',
          isRefreshing: false,
        });
      }
    },

    retryLaunches: async () => {
      const requestId = nextListRequestId();
      const { page, search } = get();

      set({ isLoading: true, error: null });
      try {
        const response = await getPaginatedLaunches(page, search);
        if (!isLatestListRequest(requestId)) return;

        const launches = response.docs.map(mapLaunchToCard);
        set({
          launches,
          hasNextPage: response.hasNextPage,
          isLoading: false,
        });
      } catch {
        if (!isLatestListRequest(requestId)) return;

        set({
          error: 'Falha ao tentar novamente.',
          isLoading: false,
        });
      }
    },

    setSearch: async (value: string) => {
      const requestId = nextListRequestId();

      set({
        search: value,
        page: 1,
        launches: [],
        hasNextPage: true,
        isLoading: true,
        isLoadingMore: false,
        isRefreshing: false,
        error: null,
      });

      try {
        const response = await getPaginatedLaunches(1, value);
        if (!isLatestListRequest(requestId)) return;

        const launches = response.docs.map(mapLaunchToCard);
        set({
          launches,
          page: 1,
          hasNextPage: response.hasNextPage,
          isLoading: false,
        });
      } catch {
        if (!isLatestListRequest(requestId)) return;

        set({
          error: 'Falha ao buscar lançamentos.',
          isLoading: false,
        });
      }
    },
  };
});
