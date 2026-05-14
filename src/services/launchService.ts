import api from "./api";
import { Launch, LaunchList } from "../@types/launch";
import { LAUNCH_LIST_PAGE_SIZE } from "../constants/launchList";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getLaunches(): Promise<Launch[]> {
  const response = await api.get<Launch[]>("launches");
  return response.data;
}

export async function getLaunchById(launchId: string): Promise<Launch> {
  const response = await api.get<Launch>(`launches/${launchId}`);
  return response.data;
}

export async function getPaginatedLaunches(
  page: number,
  search?: string,
): Promise<LaunchList> {
  const trimmedSearch = search?.trim() || "";

  const query = trimmedSearch
    ? {
        name: {
          $regex: `.*${escapeRegex(trimmedSearch)}.*`,
          $options: "i",
        },
      }
    : {};

  const response = await api.post<LaunchList>("launches/query", {
    query,
    options: {
      page,
      limit: LAUNCH_LIST_PAGE_SIZE,
      sort: {
        date_utc: "desc",
      },
    },
  });

  return response.data;
}
