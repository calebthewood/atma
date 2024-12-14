import {
  JetBrains_Mono as FontMono,
  Instrument_Sans,
} from "next/font/google";
import localFont from "next/font/local";

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const fontSerif = FontMono({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const fontSans = Instrument_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

export const fontTitle = localFont({
  src: [
    // Regular weights
    {
      path: "../public/fonts/test-sans-wide-book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/test-sans-wide-book-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/test-sans-wide.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/test-sans-wide-italic.woff2",
      weight: "500",
      style: "italic",
    },
    // Add other weights similarly...
    {
      path: "../public/fonts/test-sans-wide-bold.woff2",
      weight: "700",
      style: "normal",
    },
    // ... continue with other weights
  ],
  variable: "--font-test-sans-wide",
  display: "swap",
});
