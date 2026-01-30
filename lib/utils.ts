export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${mins}m`;
};

export const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

const minutesBetween = (from: Date, to: Date) => {
  return Math.floor((to.getTime() - from.getTime()) / 60000);
};

export const getCountdown = (value?: string, now: Date = new Date()) => {
  if (!value) {
    return null;
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const deltaMinutes = minutesBetween(now, target);
  const isOverdue = deltaMinutes < 0;
  const absMinutes = Math.abs(deltaMinutes);
  const days = Math.floor(absMinutes / (60 * 24));
  const hours = Math.floor((absMinutes % (60 * 24)) / 60);
  const minutes = absMinutes % 60;

  const parts: string[] = [];
  if (days) {
    parts.push(`${days}d`);
  }
  if (hours || days) {
    parts.push(`${hours}h`);
  }
  if (!days) {
    parts.push(`${minutes}m`);
  }

  const label = isOverdue
    ? `Overdue by ${parts.join(" ")}`
    : `${parts.join(" ")} left`;

  const tone = isOverdue ? "overdue" : deltaMinutes <= 1440 ? "soon" : "normal";

  return { label, tone };
};

export const getRunningMinutes = (
  trackedMinutes: number,
  startedAt?: string,
  now: Date = new Date()
) => {
  if (!startedAt) {
    return trackedMinutes;
  }

  const started = new Date(startedAt);
  if (Number.isNaN(started.getTime())) {
    return trackedMinutes;
  }

  const delta = minutesBetween(started, now);
  return trackedMinutes + Math.max(delta, 0);
};
