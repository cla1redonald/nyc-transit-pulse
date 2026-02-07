import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { FilterProvider } from "@/lib/filter-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NYC Transit Pulse",
  description: "Real-time visualization of NYC MTA ridership data and pandemic recovery trends",
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
