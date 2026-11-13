import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { NowPlayingBar } from "@/components/now-playing-bar";
import { PlayerProvider } from "@/components/player-provider";
import { RoomPresence } from "@/components/room-presence";
import { TrackSheet } from "@/components/track-sheet";
import "./globals.css";
import "./neumorphism.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lunaris",
  description: "A soft, neomorphic music player.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint so the saved or system theme never flashes.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <PlayerProvider>
          <RoomPresence />
          <div className="flex min-h-dvh">
            <Suspense fallback={null}>
              <AppSidebar />
            </Suspense>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
          <Suspense>
            <NowPlayingBar />
          </Suspense>
          <TrackSheet />
        </PlayerProvider>
      </body>
    </html>
  );
}
