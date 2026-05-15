const ISO_DATE_PARTS_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

function parseLaunchDateParts(value: string) {
  const match = value.match(ISO_DATE_PARTS_REGEX);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour = "00", minute = "00"] = match;

  return {
    date: new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
      ),
    ),
    hasTime: match[4] != null && match[5] != null,
  };
}

export function formatLaunchDate(value: string): string {
  const parsedDate = parseLaunchDateParts(value);

  if (!parsedDate || Number.isNaN(parsedDate.date.getTime())) {
    return value;
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(parsedDate.hasTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });

  const formattedDate = formatter.format(parsedDate.date);
  const normalizedFormattedDate = parsedDate.hasTime
    ? formattedDate.replace(", ", " às ")
    : formattedDate;

  if (value.endsWith("Z") && parsedDate.hasTime) {
    return `${normalizedFormattedDate} UTC`;
  }

  return normalizedFormattedDate;
}
