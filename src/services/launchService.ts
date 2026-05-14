import api from "./api";
import type { Launch, LaunchList } from "../@types/launch";
import { LAUNCH_LIST_PAGE_SIZE } from "../constants/launchList";
import { missaoEspecial } from "../constants/missaoEspecial";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getLaunches(): Promise<Launch[]> {
  const response = await api.get<Launch[]>("launches");
  return response.data;
}

export async function getLaunchById(launchId: string): Promise<Launch> {
  if (launchId === missaoEspecial.id) {
    return missaoEspecial;
  }

  const response = await api.get<Launch>(`launches/${launchId}`);
  return response.data;
}

function missaoEspecialMatchesSearch(search: string): boolean {
  return missaoEspecial.name.toLowerCase().includes(search.toLowerCase());
}

function withMissaoEspecial(
  launchList: LaunchList,
  search: string,
): LaunchList {
  if (
    !search ||
    launchList.hasNextPage ||
    !missaoEspecialMatchesSearch(search)
  ) {
    return launchList;
  }

  return {
    ...launchList,
    docs: [...launchList.docs, missaoEspecial],
    totalDocs: launchList.totalDocs + 1,
  };
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

  return withMissaoEspecial(response.data, trimmedSearch);
}
