"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // sync every 5 minutes

export default function TimeTracker() {
  const { data: session } = useSession();
  const accumulatedRef = useRef(0);   // seconds built up since last flush
  const startRef = useRef<number | null>(null); // timestamp when current visible session started
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function flush() {
    // Move elapsed time into accumulated bucket
    if (startRef.current !== null) {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      accumulatedRef.current += elapsed;
      startRef.current = Date.now(); // reset start to now
    }

    const seconds = accumulatedRef.current;
    if (seconds <= 0) return;
    accumulatedRef.current = 0;

    // keepalive ensures the request completes even if the tab is closing
    fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seconds }),
      keepalive: true,
    }).catch(() => {
      // On failure, return the seconds so they are not lost on next flush
      accumulatedRef.current += seconds;
    });
  }

  function startTimer() {
    if (startRef.current === null) {
      startRef.current = Date.now();
    }
  }

  function pauseTimer() {
    if (startRef.current !== null) {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      accumulatedRef.current += elapsed;
      startRef.current = null;
    }
  }

  useEffect(() => {
    if (!session?.user?.id) return;

    // Start timing immediately if tab is already visible
    if (document.visibilityState === "visible") startTimer();

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        pauseTimer();
        flush();
      } else {
        startTimer();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    // Periodic sync every 5 minutes
    intervalRef.current = setInterval(flush, SYNC_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
      pauseTimer();
      flush(); // flush on unmount
    };
  }, [session?.user?.id]);

  return null;
}
