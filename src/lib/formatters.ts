export function formatCurrency(value: number, showValue: boolean = true): string {
  if (!showValue) {
    return "R$ •••";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
}

export function getMonthReference(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function parseDdMmAaaa(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Handle ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }
  // Handle dd/mm/aaaa
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}

export function isoToDdMmAaaa(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  // Already in dd/mm/aaaa format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  // Convert ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export function getNextMonth(): Date {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth;
}

export function getMonthReferenceFromDate(date: string, monthsToAdd: number = 0): string {
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + monthsToAdd);
  return getMonthReference(dateObj);
}
