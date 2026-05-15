import { useCallback, useEffect, useRef, useState } from "react";
import { ViewToken } from "react-native";
import {
  LAUNCH_LIST_PAGE_SIZE,
  NEXT_PAGE_TRIGGER_OFFSET,
  SEARCH_DEBOUNCE_DELAY_MS,
  VIEWABILITY_ITEM_VISIBLE_PERCENT_THRESHOLD,
} from "../constants/launchList";
import { LAUNCH_ERROR_MESSAGES } from "../constants/launchMessages";
import { useLaunchStore } from "../store/launchStore";

function normalizeSearch(value: string) {
  return value.trim();
}

export function useSearchLaunches() {
  const launches = useLaunchStore((state) => state.launches);
  const hasNextPage = useLaunchStore((state) => state.hasNextPage);
  const isLoading = useLaunchStore((state) => state.isLoading);
  const isLoadingMore = useLaunchStore((state) => state.isLoadingMore);
  const isRefreshing = useLaunchStore((state) => state.isRefreshing);
  const error = useLaunchStore((state) => state.error);
  const search = useLaunchStore((state) => state.search);
  const loadInitialLaunches = useLaunchStore(
    (state) => state.loadInitialLaunches,
  );
  const refreshLaunches = useLaunchStore((state) => state.refreshLaunches);
  const retryLaunches = useLaunchStore((state) => state.retryLaunches);
  const loadMoreLaunches = useLaunchStore((state) => state.loadMoreLaunches);
  const setSearch = useLaunchStore((state) => state.setSearch);
  const [searchInput, setSearchInput] = useState(search);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const maxVisibleIndex = viewableItems.reduce((maxIndex, item) => {
        if (typeof item.index !== "number") return maxIndex;
        return Math.max(maxIndex, item.index);
      }, -1);
      if (maxVisibleIndex < 0) return;

      const {
        page,
        hasNextPage,
        isLoading,
        isLoadingMore,
        isRefreshing,
        error,
        launches,
        loadMoreLaunches,
      } = useLaunchStore.getState();
      const nextPageTriggerIndex =
        page * LAUNCH_LIST_PAGE_SIZE - NEXT_PAGE_TRIGGER_OFFSET;

      if (
        maxVisibleIndex >= nextPageTriggerIndex &&
        launches.length > 0 &&
        hasNextPage &&
        !isLoading &&
        !isLoadingMore &&
        !isRefreshing &&
        !error
      ) {
        loadMoreLaunches();
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: VIEWABILITY_ITEM_VISIBLE_PERCENT_THRESHOLD,
  }).current;

  useEffect(() => {
    loadInitialLaunches();
  }, [loadInitialLaunches]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchInput(text);

      if (text.length === 0 && search !== "") {
        void setSearch("");
      }
    },
    [search, setSearch],
  );

  const handleSubmitSearch = useCallback(
    (text: string) => {
      const normalizedText = normalizeSearch(text);

      setSearchInput(normalizedText);

      if (normalizedText !== search) {
        void setSearch(normalizedText);
      }
    },
    [search, setSearch],
  );

  const retryListError = useCallback(() => {
    const {
      error,
      hasNextPage,
      isLoading,
      isLoadingMore,
      isRefreshing,
      launches,
    } = useLaunchStore.getState();

    if (!error || isLoading || isLoadingMore || isRefreshing) return;

    if (
      error === LAUNCH_ERROR_MESSAGES.loadMore &&
      launches.length > 0 &&
      hasNextPage
    ) {
      void loadMoreLaunches();
      return;
    }

    if (error === LAUNCH_ERROR_MESSAGES.refresh && launches.length > 0) {
      void refreshLaunches();
      return;
    }

    void retryLaunches();
  }, [loadMoreLaunches, refreshLaunches, retryLaunches]);

  useEffect(() => {
    const normalizedSearchInput = normalizeSearch(searchInput);

    if (normalizedSearchInput === search) return;

    const timeoutId = setTimeout(() => {
      void setSearch(normalizedSearchInput);
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, searchInput, setSearch]);

  return {
    launches,
    hasNextPage,
    search,
    searchInput,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    refreshLaunches,
    retryLaunches,
    retryListError,
    handleSearch,
    handleSubmitSearch,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
