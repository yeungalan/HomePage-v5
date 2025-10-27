import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
//import "@/styles/style.css";
import 'mingcute_icon/font/Mingcute.css'
import Header from "@/components/Header";
import NextThemeProvider from "@/components/NextThemesProvider";
import StatsComponent from "@/components/StatComponent";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const notoSansTC = Noto_Sans_TC({
  weight: ['100','200','300','400','500','600','700','800','900'], // all weights
  subsets: ['latin', 'latin-ext'], // include necessary subsets
  display: 'swap',
});


export const metadata: Metadata = {
  title: "Alan Yeung @ Seattle, WA",
  description: "alanyeung.co Home Page | Project Atlas: Global Infrastructure Modernization Initiative 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body
        className={`dark:bg-black ${geistSans.variable} ${geistMono.variable} ${notoSansTC.className} antialiased`}
      >
<NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <StatsComponent />
          {children}
        </NextThemeProvider>
      </body>
    </html>
  );
}
