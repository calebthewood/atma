import path from "path";
import { PriceModWithSource } from "@/actions/price-mod-actions";
import { PriceMod } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatGroupSize(min: number | null, max: number | null): string {
  if (!min && !max) return "Contact for details";
  if (!max || max < 0) return `${min || 1}+ guests`;
  if (min === max) return `${min} guests`;
  return `${min || 1} - ${max} guests`;
}

function formatCityCountry(
  city: string | null | undefined,
  country: string | null | undefined
): string {
  if (!city && !country) return "Contact for details";
  return [city, country].filter(Boolean).join(", ");
}

export const toUSD = (
  value: number | string | undefined,
  showCents = false
): string => {
  const n = Number(value);
  if (isNaN(n)) return "$";
  if (typeof n !== "number") return "XX";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
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

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Use with google places api to get a continent for a location based on the "short_name" property from the api response */
export const shortNameToContinent = (shortName: string) => {
  const continentMap: { [sn: string]: string } = {
    AD: "europe",
    AE: "asia",
    AF: "asia",
    AG: "north-america",
    AI: "north-america",
    AL: "europe",
    AM: "asia",
    AN: "north-america",
    AO: "africa",
    AQ: "Antarctica",
    AR: "south-america",
    AS: "australia",
    AT: "europe",
    AU: "australia",
    AW: "north-america",
    AZ: "asia",
    BA: "europe",
    BB: "north-america",
    BD: "asia",
    BE: "europe",
    BF: "africa",
    BG: "europe",
    BH: "asia",
    BI: "africa",
    BJ: "africa",
    BM: "north-america",
    BN: "asia",
    BO: "south-america",
    BR: "south-america",
    BS: "north-america",
    BT: "asia",
    BW: "africa",
    BY: "europe",
    BZ: "north-america",
    CA: "north-america",
    CC: "asia",
    CD: "africa",
    CF: "africa",
    CG: "africa",
    CH: "europe",
    CI: "africa",
    CK: "australia",
    CL: "south-america",
    CM: "africa",
    CN: "asia",
    CO: "south-america",
    CR: "north-america",
    CU: "north-america",
    CV: "africa",
    CX: "asia",
    CY: "asia",
    CZ: "europe",
    DE: "europe",
    DJ: "africa",
    DK: "europe",
    DM: "north-america",
    DO: "north-america",
    DZ: "africa",
    EC: "south-america",
    EE: "europe",
    EG: "africa",
    EH: "africa",
    ER: "africa",
    ES: "europe",
    ET: "africa",
    FI: "europe",
    FJ: "australia",
    FK: "south-america",
    FM: "australia",
    FO: "europe",
    FR: "europe",
    GA: "africa",
    GB: "europe",
    GD: "north-america",
    GE: "asia",
    GF: "south-america",
    GG: "europe",
    GH: "africa",
    GI: "europe",
    GL: "north-america",
    GM: "africa",
    GN: "africa",
    GP: "north-america",
    GQ: "africa",
    GR: "europe",
    GS: "Antarctica",
    GT: "north-america",
    GU: "australia",
    GW: "africa",
    GY: "south-america",
    HK: "asia",
    HN: "north-america",
    HR: "europe",
    HT: "north-america",
    HU: "europe",
    ID: "asia",
    IE: "europe",
    IL: "asia",
    IM: "europe",
    IN: "asia",
    IO: "asia",
    IQ: "asia",
    IR: "asia",
    IS: "europe",
    IT: "europe",
    JE: "europe",
    JM: "north-america",
    JO: "asia",
    JP: "asia",
    KE: "africa",
    KG: "asia",
    KH: "asia",
    KI: "australia",
    KM: "africa",
    KN: "north-america",
    KP: "asia",
    KR: "asia",
    KW: "asia",
    KY: "north-america",
    KZ: "asia",
    LA: "asia",
    LB: "asia",
    LC: "north-america",
    LI: "europe",
    LK: "asia",
    LR: "africa",
    LS: "africa",
    LT: "europe",
    LU: "europe",
    LV: "europe",
    LY: "africa",
    MA: "africa",
    MC: "europe",
    MD: "europe",
    ME: "europe",
    MG: "africa",
    MH: "australia",
    MK: "europe",
    ML: "africa",
    MM: "asia",
    MN: "asia",
    MO: "asia",
    MP: "australia",
    MQ: "north-america",
    MR: "africa",
    MS: "north-america",
    MT: "europe",
    MU: "africa",
    MV: "asia",
    MW: "africa",
    MX: "north-america",
    MY: "asia",
    MZ: "africa",
    NA: "africa",
    NC: "australia",
    NE: "africa",
    NF: "australia",
    NG: "africa",
    NI: "north-america",
    NL: "europe",
    NO: "europe",
    NP: "asia",
    NR: "australia",
    NU: "australia",
    NZ: "australia",
    OM: "asia",
    PA: "north-america",
    PE: "south-america",
    PF: "australia",
    PG: "australia",
    PH: "asia",
    PK: "asia",
    PL: "europe",
    PM: "north-america",
    PN: "australia",
    PR: "north-america",
    PS: "asia",
    PT: "europe",
    PW: "australia",
    PY: "south-america",
    QA: "asia",
    RE: "africa",
    RO: "europe",
    RS: "europe",
    RU: "europe",
    RW: "africa",
    SA: "asia",
    SB: "australia",
    SC: "africa",
    SD: "africa",
    SE: "europe",
    SG: "asia",
    SH: "africa",
    SI: "europe",
    SJ: "europe",
    SK: "europe",
    SL: "africa",
    SM: "europe",
    SN: "africa",
    SO: "africa",
    SR: "south-america",
    ST: "africa",
    SV: "north-america",
    SY: "asia",
    SZ: "africa",
    TC: "north-america",
    TD: "africa",
    TF: "Antarctica",
    TG: "africa",
    TH: "asia",
    TJ: "asia",
    TK: "australia",
    TM: "asia",
    TN: "africa",
    TO: "australia",
    TR: "asia",
    TT: "north-america",
    TV: "australia",
    TW: "asia",
    TZ: "africa",
    UA: "europe",
    UG: "africa",
    US: "north-america",
    UY: "south-america",
    UZ: "asia",
    VC: "north-america",
    VE: "south-america",
    VG: "north-america",
    VI: "north-america",
    VN: "asia",
    VU: "australia",
    WF: "australia",
    WS: "australia",
    YE: "asia",
    YT: "africa",
    ZA: "africa",
    ZM: "africa",
    ZW: "africa",
  };
  return shortName in continentMap ? continentMap[shortName] : "NA";
};

/** Converts 2 character country code to country name using Intl
 * - ES -> Spain
 * - US -> United States
 * - null -> ""
 */
export const getCountryName = (countryCode: string | null): string => {
  if (!countryCode) return "";
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(countryCode.toUpperCase()) || countryCode;
  } catch (error) {
    console.warn("Intl.DisplayNames not supported:", error);
    return countryCode;
  }
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export const isEmpty = (obj: {}) => {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }
  return true;
};
