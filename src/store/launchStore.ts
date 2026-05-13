import { create } from 'zustand';
import { LaunchCard } from '../@types/launch';
import { getLancamentos } from '../services/launchService';
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
  setSearch: (value: string) => void;
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

export const useLaunchStore = create<LaunchStore>((set, get) => ({
  ...initialState,

  loadInitialLaunches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getLancamentos(1);
      const launches = response.docs.map(mapLaunchToCard);
      set({
        launches,
        page: 1,
        hasNextPage: response.hasNextPage,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load launches',
        isLoading: false,
      });
    }
  },

  loadMoreLaunches: async () => {
    const { page, hasNextPage, isLoadingMore } = get();
    if (!hasNextPage || isLoadingMore) return;

    set({ isLoadingMore: true, error: null });
    try {
      const nextPage = page + 1;
      const response = await getLancamentos(nextPage);
      const newLaunches = response.docs.map(mapLaunchToCard);
      set((state) => ({
        launches: [...state.launches, ...newLaunches],
        page: nextPage,
        hasNextPage: response.hasNextPage,
        isLoadingMore: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more launches',
        isLoadingMore: false,
      });
    }
  },

  refreshLaunches: async () => {
    set({ isRefreshing: true, error: null });
    try {
      const response = await getLancamentos(1);
      const launches = response.docs.map(mapLaunchToCard);
      set({
        launches,
        page: 1,
        hasNextPage: response.hasNextPage,
        isRefreshing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh launches',
        isRefreshing: false,
      });
    }
  },

  retryLaunches: async () => {
    const { page } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await getLancamentos(page);
      const launches = response.docs.map(mapLaunchToCard);
      set({
        launches,
        hasNextPage: response.hasNextPage,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to retry launches',
        isLoading: false,
      });
    }
  },

  setSearch: (value: string) => {
    set({ search: value });
  },
}));