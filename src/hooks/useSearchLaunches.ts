import { useLaunchStore } from '../store/launchStore';

export function useSearchLaunches() {
  const launches = useLaunchStore((state) => state.launches);
  const search = useLaunchStore((state) => state.search);
  const isLoading = useLaunchStore((state) => state.isLoading);
  const setSearch = useLaunchStore((state) => state.setSearch);

  return {
    launches,
    search,
    isLoading,
    setSearch,
  };
}
