import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "StreamFlix",
  description: "A modern Netflix-style web app powered by Next.js, Supabase, and TMDb.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "StreamFlix",
    description: "A modern Netflix-style web app powered by Next.js, Supabase, and TMDb.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
