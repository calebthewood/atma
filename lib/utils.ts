import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toUSD = (value: any): string => {
  const n = Number(value);
  if (isNaN(n)) return "$";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
};