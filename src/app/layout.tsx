import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProgressProvider } from "@/components/progress/ProgressProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "AI Fluency Lab",
  title: {
    default: "AI Fluency Lab — Learn to think with AI, not just ask AI",
    template: "%s · AI Fluency Lab",
  },
  description:
    "An interactive laboratory that teaches students how to decide what to delegate to AI, how to describe a task, how to judge the result, and when to verify it.",
  keywords: [
    "AI literacy",
    "AI fluency",
    "delegation",
    "description",
    "discernment",
    "diligence",
    "education",
  ],
  authors: [{ name: "AI Fluency Lab" }],
  openGraph: {
    title: "AI Fluency Lab",
    description: "Learn to think with AI, not just ask AI.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-glow-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
        >
          Skip to content
        </a>

        <div className="lab-backdrop" aria-hidden="true" />

        <ProgressProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />

            <main
              id="main"
              className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-10 md:pb-14"
            >
              {children}
            </main>

            <footer className="mx-auto w-full max-w-5xl px-4 pb-28 sm:px-6 md:pb-10">
              <div className="border-t border-ink-800 pt-6 text-xs leading-relaxed text-mist-400">
                <p className="max-w-3xl">
                  AI Fluency Lab is an independent educational project. It is not
                  affiliated with, or endorsed by, the Examinations Council of
                  Zambia, Zambia&rsquo;s Ministry of Education, Anthropic, or
                  Groq. AI output can be confidently wrong — verify anything that
                  matters.
                </p>
              </div>
            </footer>

            <BottomNav />
          </div>
        </ProgressProvider>
      </body>
    </html>
  );
}
