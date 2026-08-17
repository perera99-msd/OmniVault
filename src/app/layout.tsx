import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { BiometricOverlay } from "@/components/auth/BiometricOverlay";
import { Toaster } from "sonner";
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

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tria — Wealth, Income, Expenses",
  description: "Experience the next generation of private wealth management. Intelligent, secure, and crafted for modern financial clarity.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tria Finance",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#121412" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${cinzel.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background transition-colors duration-500 overscroll-none prevent-select" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div id="app-wrapper" className="flex-1 flex flex-col h-full w-full relative">
            {/* Ambient Background Aura - Heirloom Green & Aged Gold */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] transition-all duration-700" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] transition-all duration-700" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col flex-1">
              <AuthOverlay>
                <BiometricOverlay>{children}</BiometricOverlay>
              </AuthOverlay>
            </div>
            <Toaster position="top-center" richColors theme="system" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
