import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Navigation from "@/components/Navigation";
import { createClient as createServerClient } from "@/utils/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thoughts2Action (T2A) | Turn your thoughts into action",
  description:
    "Capture fleeting thoughts via voice or video, use AI to summarize, and save them permanently in your second brain. Never lose an idea again.",
  keywords:
    "AI idea tracker, voice-to-idea app, indie hacker productivity, second brain app, idea logging tool, AI workflow, Google Sheets journal, MVP builder, build in public, 30 day challenge",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();

  // 2️⃣ Fetch the session once on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {/* Navigation */}
        <Navigation user={user} />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
