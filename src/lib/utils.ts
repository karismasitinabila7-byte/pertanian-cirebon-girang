/**
 * Helper utility functions
 */

export function formatHectares(squareMeters: number): string {
  const hectares = squareMeters / 10000;
  return `${hectares.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ha`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString("id-ID");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndonesian(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
