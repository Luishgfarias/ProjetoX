import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LaunchCard, LaunchList } from "../@types/launch";
import { LAUNCH_CACHE_KEY_PREFIX } from "../constants/storage";

type CachedLaunchList = LaunchList<LaunchCard>;

function normalizeSearch(search?: string): string {
  return search?.trim().toLowerCase() || "all";
}

function getCacheKey(page: number, search?: string): string {
  const encodedSearch = encodeURIComponent(normalizeSearch(search));
  return `${LAUNCH_CACHE_KEY_PREFIX}${encodedSearch}_${page}`;
}

export async function saveLaunchPage(
  page: number,
  search: string | undefined,
  data: CachedLaunchList,
): Promise<void> {
  try {
    const key = getCacheKey(page, search);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving page ${page} to storage:`, error);
  }
}

export async function getLaunchPage(
  page: number,
  search?: string,
): Promise<CachedLaunchList | null> {
  try {
    const key = getCacheKey(page, search);
    const cachedData = await AsyncStorage.getItem(key);

    if (cachedData === null) {
      return null;
    }

    return JSON.parse(cachedData) as CachedLaunchList;
  } catch (error) {
    console.error(`Error reading page ${page} from storage:`, error);
    return null;
  }
}

export async function clearLaunchCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) =>
      key.startsWith(LAUNCH_CACHE_KEY_PREFIX),
    );

    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map((key) => AsyncStorage.removeItem(key)));
    }
  } catch (error) {
    console.error("Error clearing launch cache:", error);
  }
}
