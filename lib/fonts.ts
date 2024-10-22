import {
  JetBrains_Mono as FontMono,
  Inter as FontSans,
  Montserrat,
  Roboto,
} from "next/font/google";

export const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const fontSerif = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** Style guide uses Gilroy (sans) for titles & marketing, webflow  site uses Goudosb (serif).
 * Using Roboto here as a free alternative to Gilroy. Ask Scarlett & Anas.
 */
export const fontTitle = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});
