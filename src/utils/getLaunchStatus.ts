import type { Launch, LaunchCard } from "../@types/launch";

export type LaunchStatus = {
  label: string;
  className: string;
};

export const LAUNCH_STATUS = {
  upcoming: {
    label: "Agendado",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
  success: {
    label: "Sucesso",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  delayed: {
    label: "Atrasado",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  failure: {
    label: "Falha",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  },
  unknown: {
    label: "Indefinido",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  },
} as const satisfies Record<string, LaunchStatus>;

export function getLaunchStatus(
  launch: Pick<
    Launch | LaunchCard,
    "success" | "upcoming" | "date_utc" | "date_precision"
  >,
): LaunchStatus {
  if (launch.upcoming) {
    if (isLaunchDelayed(launch.date_utc, launch.date_precision)) {
      return LAUNCH_STATUS.delayed;
    }

    return LAUNCH_STATUS.upcoming;
  }

  if (launch.success === true) {
    return LAUNCH_STATUS.success;
  }

  if (launch.success === false) {
    return LAUNCH_STATUS.failure;
  }

  return LAUNCH_STATUS.unknown;
}

function isLaunchDelayed(
  dateUtc: string,
  datePrecision: Launch["date_precision"],
): boolean {
  const launchDate = new Date(dateUtc);

  if (Number.isNaN(launchDate.getTime())) {
    return false;
  }

  return Date.now() > getLaunchPrecisionEnd(launchDate, datePrecision).getTime();
}

function getLaunchPrecisionEnd(
  launchDate: Date,
  datePrecision: Launch["date_precision"],
): Date {
  const year = launchDate.getUTCFullYear();
  const month = launchDate.getUTCMonth();
  const day = launchDate.getUTCDate();
  const hour = launchDate.getUTCHours();

  switch (datePrecision) {
    case "year":
      return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    case "month":
      return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    case "day":
      return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    case "hour":
    default:
      return new Date(Date.UTC(year, month, day, hour, 59, 59, 999));
  }
}
