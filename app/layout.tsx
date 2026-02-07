import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { FilterProvider } from "@/lib/filter-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NYC Transit Pulse — MTA Ridership Dashboard",
  description: "Interactive visualization of NYC MTA ridership data across Subway, Bus, LIRR, Metro-North, and more. Explore pandemic recovery, congestion pricing impact, and day-of-week patterns.",
  keywords: "NYC, MTA, transit, ridership, subway, bus, data visualization, pandemic recovery, congestion pricing",
  authors: [{ name: "Claire Donald" }],
  openGraph: {
    title: "NYC Transit Pulse — MTA Ridership Dashboard",
    description: "Interactive visualization of NYC MTA ridership data across Subway, Bus, LIRR, Metro-North, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NYC Transit Pulse — MTA Ridership Dashboard",
    description: "Interactive visualization of NYC MTA ridership data across all transit modes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <FilterProvider>
            {children}
          </FilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
