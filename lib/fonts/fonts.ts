import { JetBrains_Mono as FontMono, Instrument_Sans } from "next/font/google";
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

export const fontTitle = Instrument_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

export const fontSans = localFont({
  src: [
    // Extra Light
    {
      path: "./test-sans-wide-extra-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./test-sans-wide-light-italic.woff2",
      weight: "300",
      style: "italic",
    },
    // Book (Light)
    {
      path: "./test-sans-wide-book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./test-sans-wide-book-italic.woff2",
      weight: "400",
      style: "italic",
    },
    // Regular/Medium
    // {
    //   path: "./test-sans-wide.woff2",
    //   weight: "500",
    //   style: "normal",
    // },
    {
      path: "./test-sans-wide-italic.woff2",
      weight: "500",
      style: "italic",
    },
    // Half Bold
    {
      path: "./test-sans-wide-half-bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./test-sans-wide-half-bold-italic.woff2",
      weight: "600",
      style: "italic",
    },
    // Bold
    {
      path: "./test-sans-wide-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./test-sans-wide-bold-kursiv.woff2",
      weight: "700",
      style: "italic",
    },
    // Three Quarter Bold
    {
      path: "./test-sans-wide-three-quarter-bold.woff2",
      weight: "750",
      style: "normal",
    },
    {
      path: "./test-sans-wide-three-quarter-bold-italic.woff2",
      weight: "750",
      style: "italic",
    },
    // Extra Bold
    {
      path: "./test-sans-wide-extra-bold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./test-sans-wide-extra-bold-italic.woff2",
      weight: "800",
      style: "italic",
    },
    // Strong
    {
      path: "./test-sans-wide-strong.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "./test-sans-wide-strong-italic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-test-sans-wide",
  display: "swap",
});
