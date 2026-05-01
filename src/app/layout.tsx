import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeClerk – Financial Research Reports Platform",
  description:
    "Access institutional-grade financial research reports from top analysts. Stock reports, IPO analysis, sector insights, and market outlook at TradeClerk.",
  keywords: [
    "financial research",
    "stock reports",
    "IPO analysis",
    "sector reports",
    "market outlook",
    "analyst research",
    "TradeClerk",
  ],
  authors: [{ name: "TradeClerk" }],
  icons: {
    icon: "/logo.svg",
  },
  verification: {
    google: "uEGDxnRFWEbjfNv1GHDGCFbZ8uJD5hvuxFujMWj8Ic4",
  },
  openGraph: {
    title: "TradeClerk – Financial Research Reports Platform",
    description:
      "Access institutional-grade financial research reports from top analysts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
