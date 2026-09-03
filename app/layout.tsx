import type { Metadata } from "next";
import { Poppins, Lora, Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

const embed = "/embed.png";

export const metadata: Metadata = {
  title: "Better Together",
  description: "The habit tracker for love birds.",
  openGraph: {
    images: [
      {
        url: embed,
        secureUrl: embed,
      },
    ],
  },
  twitter: {
    images: [
      {
        url: embed,
        secureUrl: embed,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased h-full dark`}
      >
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
