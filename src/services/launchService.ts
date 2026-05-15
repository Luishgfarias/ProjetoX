import api from "./api";
import type { Launch, LaunchCard, LaunchList } from "../@types/launch";
import { LAUNCH_LIST_PAGE_SIZE } from "../constants/launchList";
import { missaoEspecial } from "../constants/missaoEspecial";
import { mapLaunchToCard } from "../utils/mapLaunchToCard";

type LaunchListItemResponse = Pick<
  Launch,
  | "id"
  | "name"
  | "flight_number"
  | "date_utc"
  | "date_local"
  | "date_precision"
  | "upcoming"
  | "success"
> & {
  links: {
    patch: {
      small: string | null;
    } | null;
  };
};

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
  launchList: LaunchList<LaunchCard>,
  search: string,
): LaunchList<LaunchCard> {
  if (
    !search ||
    launchList.hasNextPage ||
    !missaoEspecialMatchesSearch(search)
  ) {
    return launchList;
  }

  return {
    ...launchList,
    docs: [...launchList.docs, mapLaunchToCard(missaoEspecial)],
    totalDocs: launchList.totalDocs + 1,
  };
}

export async function getPaginatedLaunches(
  page: number,
  search?: string,
): Promise<LaunchList<LaunchCard>> {
  const trimmedSearch = search?.trim() || "";

  const query = trimmedSearch
    ? {
        name: {
          $regex: `.*${escapeRegex(trimmedSearch)}.*`,
          $options: "i",
        },
      }
    : {};

  const response = await api.post<LaunchList<LaunchListItemResponse>>(
    "launches/query",
    {
      query,
      options: {
        page,
        limit: LAUNCH_LIST_PAGE_SIZE,
        select: [
          "id",
          "name",
          "flight_number",
          "date_utc",
          "date_local",
          "date_precision",
          "upcoming",
          "success",
          "links.patch.small",
        ],
        sort: {
          date_utc: "desc",
        },
      },
    },
  );

  const launchList = {
    ...response.data,
    docs: response.data.docs.map(mapLaunchToCard),
  };

  return withMissaoEspecial(launchList, trimmedSearch);
}
