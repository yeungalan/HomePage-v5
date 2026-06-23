import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import 'mingcute_icon/font/Mingcute.css'
import Script from "next/script";
import Header from "@/components/Header";
import NextThemeProvider from "@/components/NextThemesProvider";
import { I18nProvider } from "@/i18n";
import StatsComponent from "@/components/StatComponent";
import { IconifyConfig } from "@/components/IconifyConfig";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['monospace'],
})

const notoSansTC = Noto_Sans_TC({
  weight: ['100','200','300','400','500','600','700','800','900'], // all weights
  subsets: ['latin', 'latin-ext'], // include necessary subsets
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});


export const metadata: Metadata = {
  title: "Alan Yeung @ Tokyo, JP",
  description: "alanyeung.co Home Page | Project Atlas: Global Infrastructure Modernization Initiative 2025",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`dark:bg-black ${geistSans.variable} ${geistMono.variable} ${notoSansTC.className} antialiased`}
      >
        <IconifyConfig />
        <I18nProvider>
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
        </I18nProvider>
        <Analytics />
        <SpeedInsights/>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5W3MDW6YSY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5W3MDW6YSY');
          `}
        </Script>
      </body>
    </html>
  );
}
