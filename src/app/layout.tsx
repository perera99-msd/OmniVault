import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
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

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniVault - Your wealth. Every source.",
  description: "A highly scalable, mobile-first Personal Finance PWA.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#003300",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f5f5f5] dark:bg-[#0a0a0a] transition-colors duration-500" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div id="app-wrapper" className="flex-1 flex flex-col h-full w-full relative">
            {/* Global Ambient Background Effects - Adapts to Light/Dark */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#66cc66]/20 dark:bg-[#006600]/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen transition-all duration-700" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#009900]/10 dark:bg-[#009900]/10 blur-[140px] mix-blend-multiply dark:mix-blend-screen transition-all duration-700" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col flex-1">
              <AuthOverlay>
                <BiometricOverlay>{children}</BiometricOverlay>
              </AuthOverlay>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
