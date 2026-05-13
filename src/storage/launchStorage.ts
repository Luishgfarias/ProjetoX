import AsyncStorage from '@react-native-async-storage/async-storage';
import { LaunchList } from '../@types/launch';

const CACHE_KEY_PREFIX = '@launches_cache_';

function getCacheKey(page: number): string {
  return `${CACHE_KEY_PREFIX}${page}`;
}

export async function saveLaunchPage(
  page: number,
  data: LaunchList
): Promise<void> {
  try {
    const key = getCacheKey(page);
    const serializedData = JSON.stringify(data);
    await AsyncStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving page ${page} to storage:`, error);
    throw new Error(`Failed to save page ${page} to local cache`);
  }
}

export async function getLaunchPage(
  page: number
): Promise<LaunchList | null> {
  try {
    const key = getCacheKey(page);
    const cachedData = await AsyncStorage.getItem(key);

    if (cachedData === null) {
      return null;
    }

    const parsedData = JSON.parse(cachedData) as LaunchList;
    return parsedData;
  } catch (error) {
    console.error(`Error reading page ${page} from storage:`, error);
    return null;
  }
}

export async function clearLaunchCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) =>
      key.startsWith(CACHE_KEY_PREFIX)
    );

    if (cacheKeys.length > 0) {
      await Promise.all(
        cacheKeys.map((key) => AsyncStorage.removeItem(key))
      );
    }
  } catch (error) {
    console.error('Error clearing launch cache:', error);
    throw new Error('Failed to clear launch cache');
  }
}
