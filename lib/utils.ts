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
    AD: "Europe",
    AE: "Asia",
    AF: "Asia",
    AG: "North America",
    AI: "North America",
    AL: "Europe",
    AM: "Asia",
    AN: "North America",
    AO: "Africa",
    AQ: "Antarctica",
    AR: "South America",
    AS: "Australia",
    AT: "Europe",
    AU: "Australia",
    AW: "North America",
    AZ: "Asia",
    BA: "Europe",
    BB: "North America",
    BD: "Asia",
    BE: "Europe",
    BF: "Africa",
    BG: "Europe",
    BH: "Asia",
    BI: "Africa",
    BJ: "Africa",
    BM: "North America",
    BN: "Asia",
    BO: "South America",
    BR: "South America",
    BS: "North America",
    BT: "Asia",
    BW: "Africa",
    BY: "Europe",
    BZ: "North America",
    CA: "North America",
    CC: "Asia",
    CD: "Africa",
    CF: "Africa",
    CG: "Africa",
    CH: "Europe",
    CI: "Africa",
    CK: "Australia",
    CL: "South America",
    CM: "Africa",
    CN: "Asia",
    CO: "South America",
    CR: "North America",
    CU: "North America",
    CV: "Africa",
    CX: "Asia",
    CY: "Asia",
    CZ: "Europe",
    DE: "Europe",
    DJ: "Africa",
    DK: "Europe",
    DM: "North America",
    DO: "North America",
    DZ: "Africa",
    EC: "South America",
    EE: "Europe",
    EG: "Africa",
    EH: "Africa",
    ER: "Africa",
    ES: "Europe",
    ET: "Africa",
    FI: "Europe",
    FJ: "Australia",
    FK: "South America",
    FM: "Australia",
    FO: "Europe",
    FR: "Europe",
    GA: "Africa",
    GB: "Europe",
    GD: "North America",
    GE: "Asia",
    GF: "South America",
    GG: "Europe",
    GH: "Africa",
    GI: "Europe",
    GL: "North America",
    GM: "Africa",
    GN: "Africa",
    GP: "North America",
    GQ: "Africa",
    GR: "Europe",
    GS: "Antarctica",
    GT: "North America",
    GU: "Australia",
    GW: "Africa",
    GY: "South America",
    HK: "Asia",
    HN: "North America",
    HR: "Europe",
    HT: "North America",
    HU: "Europe",
    ID: "Asia",
    IE: "Europe",
    IL: "Asia",
    IM: "Europe",
    IN: "Asia",
    IO: "Asia",
    IQ: "Asia",
    IR: "Asia",
    IS: "Europe",
    IT: "Europe",
    JE: "Europe",
    JM: "North America",
    JO: "Asia",
    JP: "Asia",
    KE: "Africa",
    KG: "Asia",
    KH: "Asia",
    KI: "Australia",
    KM: "Africa",
    KN: "North America",
    KP: "Asia",
    KR: "Asia",
    KW: "Asia",
    KY: "North America",
    KZ: "Asia",
    LA: "Asia",
    LB: "Asia",
    LC: "North America",
    LI: "Europe",
    LK: "Asia",
    LR: "Africa",
    LS: "Africa",
    LT: "Europe",
    LU: "Europe",
    LV: "Europe",
    LY: "Africa",
    MA: "Africa",
    MC: "Europe",
    MD: "Europe",
    ME: "Europe",
    MG: "Africa",
    MH: "Australia",
    MK: "Europe",
    ML: "Africa",
    MM: "Asia",
    MN: "Asia",
    MO: "Asia",
    MP: "Australia",
    MQ: "North America",
    MR: "Africa",
    MS: "North America",
    MT: "Europe",
    MU: "Africa",
    MV: "Asia",
    MW: "Africa",
    MX: "North America",
    MY: "Asia",
    MZ: "Africa",
    NA: "Africa",
    NC: "Australia",
    NE: "Africa",
    NF: "Australia",
    NG: "Africa",
    NI: "North America",
    NL: "Europe",
    NO: "Europe",
    NP: "Asia",
    NR: "Australia",
    NU: "Australia",
    NZ: "Australia",
    OM: "Asia",
    PA: "North America",
    PE: "South America",
    PF: "Australia",
    PG: "Australia",
    PH: "Asia",
    PK: "Asia",
    PL: "Europe",
    PM: "North America",
    PN: "Australia",
    PR: "North America",
    PS: "Asia",
    PT: "Europe",
    PW: "Australia",
    PY: "South America",
    QA: "Asia",
    RE: "Africa",
    RO: "Europe",
    RS: "Europe",
    RU: "Europe",
    RW: "Africa",
    SA: "Asia",
    SB: "Australia",
    SC: "Africa",
    SD: "Africa",
    SE: "Europe",
    SG: "Asia",
    SH: "Africa",
    SI: "Europe",
    SJ: "Europe",
    SK: "Europe",
    SL: "Africa",
    SM: "Europe",
    SN: "Africa",
    SO: "Africa",
    SR: "South America",
    ST: "Africa",
    SV: "North America",
    SY: "Asia",
    SZ: "Africa",
    TC: "North America",
    TD: "Africa",
    TF: "Antarctica",
    TG: "Africa",
    TH: "Asia",
    TJ: "Asia",
    TK: "Australia",
    TM: "Asia",
    TN: "Africa",
    TO: "Australia",
    TR: "Asia",
    TT: "North America",
    TV: "Australia",
    TW: "Asia",
    TZ: "Africa",
    UA: "Europe",
    UG: "Africa",
    US: "North America",
    UY: "South America",
    UZ: "Asia",
    VC: "North America",
    VE: "South America",
    VG: "North America",
    VI: "North America",
    VN: "Asia",
    VU: "Australia",
    WF: "Australia",
    WS: "Australia",
    YE: "Asia",
    YT: "Africa",
    ZA: "Africa",
    ZM: "Africa",
    ZW: "Africa",
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
