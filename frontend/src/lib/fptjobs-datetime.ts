const vietnamTimeZone = "Asia/Ho_Chi_Minh";
const sqliteTimestampPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export function parseFptJobsTimestamp(value?: string | null) {
  const rawValue = value?.trim();

  if (!rawValue) return null;

  const normalizedValue = sqliteTimestampPattern.test(rawValue) ? `${rawValue.replace(" ", "T")}Z` : rawValue;
  const dateValue = new Date(normalizedValue);

  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
}

export function formatVietnamDateTimeFromDate(dateValue: Date) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: vietnamTimeZone,
    year: "numeric",
  }).format(dateValue);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: vietnamTimeZone,
  }).format(dateValue);

  return `${date} ${time}`;
}

export function formatVietnamDateTime(value?: string | null, fallbackDate = new Date()) {
  return formatVietnamDateTimeFromDate(parseFptJobsTimestamp(value) ?? fallbackDate);
}
