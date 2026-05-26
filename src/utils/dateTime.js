const pad = (value) => String(value).padStart(2, '0');

export function toDateTimeInputValue(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDateTime(value) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function dateFromSearchParams(params) {
  const dateTime = params.get('dt');
  if (dateTime) return parseLocalDateTime(dateTime);

  const year = Number(params.get('y'));
  const month = Number(params.get('m'));
  const day = Number(params.get('d'));
  const hour = Number(params.get('h'));
  const minute = Number(params.get('min') || 0);

  if (!year || !month || !day || Number.isNaN(hour)) return new Date();
  return new Date(year, month - 1, day, hour, minute);
}

export function formatDateTimeCN(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
