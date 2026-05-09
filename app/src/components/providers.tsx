"use client";

import { SessionProvider } from "next-auth/react";
import ThemeProvider from "./ThemeProvider";
import TimeTracker from "./TimeTracker";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TimeTracker />
        <PWAInstallPrompt />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
