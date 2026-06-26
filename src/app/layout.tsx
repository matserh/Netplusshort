import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Netplus | Premium Cinema Streaming",
  description: "Votre destination premium pour les films et séries en streaming.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <head><meta name="theme-color" content="#0f0f23" /></head>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}>
        <AuthProvider>
          {children}
          <BottomNav />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
