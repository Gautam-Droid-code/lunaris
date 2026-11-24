import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lunaris.app",
  appName: "Lunaris",
  // Tiny placeholder shell only; the real UI is loaded from server.url below.
  webDir: "native-shell",
  server: {
    // Public site (downloadable build). Switch to the LAN URL below for local testing.
    url: "https://lunaris-droid-nerds.vercel.app",
    // url: "http://192.168.1.8:3000",
    cleartext: false,
  },
  plugins: {
    CapacitorAudioPlayer: {},
  },
};

export default config;