import { Launch, LaunchCard } from "../@types/launch";

export function mapLaunchToCard(
  launch: Pick<
    Launch,
    | "id"
    | "name"
    | "flight_number"
    | "date_utc"
    | "date_local"
    | "upcoming"
    | "success"
  > & {
    links: {
      patch: {
        small: string | null;
      };
    };
  },
): LaunchCard {
  return {
    id: launch.id,
    name: launch.name,
    flight_number: launch.flight_number,
    date_utc: launch.date_utc,
    date_local: launch.date_local,
    upcoming: launch.upcoming,
    success: launch.success,
    patchImage: launch.links.patch.small,
  };
}
