import type { Launch, LaunchCard } from "../@types/launch";

export type LaunchStatus = {
  label: string;
  className: string;
};

export const LAUNCH_STATUS = {
  upcoming: {
    label: "Agendado",
    className: "bg-sky-100 text-slate-700",
  },
  success: {
    label: "Sucesso",
    className: "bg-emerald-50 text-stone-600",
  },
  failure: {
    label: "Falha",
    className: "bg-rose-50 text-stone-600",
  },
  unknown: {
    label: "Indefinido",
    className: "bg-gray-100 text-gray-700",
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
