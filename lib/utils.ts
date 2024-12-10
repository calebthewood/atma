import path from "path";
import { PriceModWithSource } from "@/actions/price-mod-actions";
import { PriceMod } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toUSD = (value: number | undefined): string => {
  if (typeof value !== "number") return "XX";
  const n = Number(value);
  if (isNaN(n)) return "$";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
};

/** Accepts filename or path, returns .ext
 *
 * ex: dir/hello-world.jpg --> .jpg
 */
export function getFileExtension(filename: string) {
  try {
    if (filename.startsWith("http")) {
      return path.extname(new URL(filename).pathname).toLowerCase();
    }
    return path.extname(filename).toLowerCase();
  } catch {
    return `.${filename.split(".").pop()?.toLowerCase() || ""}`;
  }
}

export function toKebabCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-"); // Remove consecutive -
}

export function sumPriceList(prices: PriceMod[] | null) {
  if (prices === null) return 0;
  let sum = 0;
  for (const p of prices) if (p.value) sum += p.value;
  return sum;
}

// Helper function to calculate the final price based on all applicable price mods
export function calculatePriceMods(priceMods: PriceModWithSource[]): number {
  let basePrice = 0;
  let modifiers = 0;
  let fees = 0;
  let taxes = 0;

  for (const mod of priceMods) {
    const value =
      mod.unit === "PERCENT" ? basePrice * (mod.value / 100) : mod.value;

    switch (mod.type) {
      case "BASE_PRICE":
        basePrice = value;
        break;
      case "BASE_MOD":
        modifiers += value;
        break;
      case "FEE":
        fees += value;
        break;
      case "TAX":
        taxes += value;
        break;
      // ADDONs are not included in the base calculation
    }
  }

  return basePrice + modifiers + fees + taxes;
}
