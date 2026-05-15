import { Launch, LaunchCard } from "../@types/launch";

export function mapLaunchToCard(
  launch: Pick<
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
  },
): LaunchCard {
  return {
    id: launch.id,
    name: launch.name,
    flight_number: launch.flight_number,
    date_utc: launch.date_utc,
    date_local: launch.date_local,
    date_precision: launch.date_precision,
    upcoming: launch.upcoming,
    success: launch.success,
    patchImage: launch.links.patch?.small ?? null,
  };
}
