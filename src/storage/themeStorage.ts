import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEME_PREFERENCE_KEY } from "../constants/storage";

export type ThemePreference = "light" | "dark";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark";
}

export async function getThemePreference(): Promise<ThemePreference | null> {
  try {
    const preference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    return isThemePreference(preference) ? preference : null;
  } catch (error) {
    console.error("Error reading theme preference from storage:", error);
    return null;
  }
}

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
  } catch (error) {
    console.error("Error saving theme preference to storage:", error);
  }
}
