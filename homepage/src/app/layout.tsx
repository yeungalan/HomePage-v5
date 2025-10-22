import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
//import "@/styles/style.css";
import 'mingcute_icon/font/Mingcute.css'
import Header from "@/components/Header";
import NextThemeProvider from "@/components/NextThemesProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alan Yeung @ Seattle, WA",
  description: "Home Page v5 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`dark:bg-black ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </NextThemeProvider>
      </body>
    </html>
  );
}
