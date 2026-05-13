export type LancamentoList = {
  docs: Lancamento[];
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

export type Lancamento = {
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
  crew: string[];
  ships: string[];
  capsules: string[];
  fairings: LancamentoFairings;
  links: LancamentoLinks;
  failures: LancamentoFailure[];
  cores: LancamentoCore[];
  auto_update: boolean;
  launch_library_id: string | null;
};

export type LancamentoFairings = {
  reused: boolean | null;
  recovery_attempt: boolean | null;
  recovered: boolean | null;
  ships: string[];
};

export type LancamentoLinks = {
  patch: LancamentoPatchLinks;
  reddit: LancamentoRedditLinks;
  flickr: LancamentoFlickrLinks;
  presskit: string | null;
  webcast: string | null;
  youtube_id: string | null;
  article: string | null;
  wikipedia: string | null;
};

export type LancamentoPatchLinks = {
  small: string | null;
  large: string | null;
};

export type LancamentoRedditLinks = {
  campaign: string | null;
  launch: string | null;
  media: string | null;
  recovery: string | null;
};

export type LancamentoFlickrLinks = {
  small: string[];
  original: string[];
};

export type LancamentoFailure = {
  time?: number;
  altitude?: number;
  reason?: string;
};

export type LancamentoCore = {
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

/**
 * Tipo resumido pra usar em cards/listagem UI
 */
export type LancamentoCard =
  Pick<
    Lancamento,
    | "id"
    | "name"
    | "flight_number"
    | "date_utc"
    | "date_local"
    | "upcoming"
    | "success"
  > & {
    patchImage: string | null;
  };
