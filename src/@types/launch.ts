export type LaunchList<T = Launch> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type Launch = {
  id: string;
  name: string;
  flight_number: number;
  rocket: string;
  payloads: string[];
  launchpad: string;
  upcoming: boolean;
  success: boolean | null;
  details: string | null;
  date_utc: string;
  date_unix: number;
  date_local: string;
  date_precision: "hour" | "day" | "month" | "year";
  static_fire_date_utc: string | null;
  static_fire_date_unix: number | null;
  net: boolean;
  window: number | null;
  tbd: boolean;
  crew: LaunchCrew[];
  ships: string[];
  capsules: string[];
  fairings: LaunchFairings | null;
  links: LaunchLinks;
  failures: LaunchFailure[] | null;
  cores: LaunchCore[] | null;
  auto_update: boolean;
  launch_library_id: string | null;
};

export type LaunchFairings = {
  reused: boolean | null;
  recovery_attempt: boolean | null;
  recovered: boolean | null;
  ships: string[];
};

export type LaunchCrew = {
  crew: string;
  role: string | null;
};

export type LaunchLinks = {
  patch: LaunchPatchLinks | null;
  reddit: LaunchRedditLinks;
  flickr: LaunchFlickrLinks;
  presskit: string | null;
  webcast:
    | string
    | number
    | null
    | {
        uri?: string;
        assetId?: number;
      };
  youtube_id: string | null;
  article: string | null;
  wikipedia: string | null;
};

export type LaunchPatchLinks = {
  small: string | null;
  large: string | null;
};

export type LaunchRedditLinks = {
  campaign: string | null;
  launch: string | null;
  media: string | null;
  recovery: string | null;
};

export type LaunchFlickrLinks = {
  small: string[];
  original: string[];
};

export type LaunchFailure = {
  time?: number;
  altitude?: number;
  reason?: string;
};

export type LaunchCore = {
  core: string | null;
  flight: number | null;
  gridfins: boolean | null;
  legs: boolean | null;
  reused: boolean | null;
  landing_attempt: boolean | null;
  landing_success: boolean | null;
  landing_type: string | null;
  landpad: string | null;
};

export type LaunchCard = Pick<
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
  patchImage: string | null;
};
