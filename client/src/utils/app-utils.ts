export function toPersianNum(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("fa-IR").format(value);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
};

export const toPersianDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export function secondToMinute(sec: number): number {
  if (!sec) return 0;
  return Math.round(sec / 60);
}

export function kbToMb(kb: number): number {
  if (!kb) return 0;
  return Math.round(kb / 1024);
}

// Helper function to format seconds into HH-MM-SS
export const formatSeconds = (totalSeconds: number = 0) => {
  totalSeconds = Math.max(0, Math.floor(totalSeconds || 0));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};
