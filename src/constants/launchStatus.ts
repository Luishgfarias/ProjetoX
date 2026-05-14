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
  launch: Pick<Launch | LaunchCard, "success" | "upcoming">,
): LaunchStatus {
  if (launch.upcoming) {
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
