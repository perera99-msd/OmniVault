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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OmniVault",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background transition-colors duration-500 overscroll-none prevent-select" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div id="app-wrapper" className="flex-1 flex flex-col h-full w-full relative">
            {/* Global Ambient Background Effects - Adapts to Light/Dark */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] transition-all duration-700" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-teal-400/10 dark:bg-emerald-900/10 blur-[140px] transition-all duration-700" />
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
