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
