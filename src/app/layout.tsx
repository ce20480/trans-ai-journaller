import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
