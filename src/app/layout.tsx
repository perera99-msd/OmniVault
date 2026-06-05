import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { BiometricOverlay } from "@/components/auth/BiometricOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniVault - Your wealth. Every source. One vault.",
  description: "A highly scalable, mobile-first Personal Finance PWA.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#003300",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthOverlay>
            <BiometricOverlay>{children}</BiometricOverlay>
          </AuthOverlay>
        </ThemeProvider>
      </body>
    </html>
  );
}
