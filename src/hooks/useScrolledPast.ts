"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks whether the page has been scrolled past `threshold` pixels,
 * via useSyncExternalStore so scroll updates never trigger a React
 * effect->setState cascade — only a genuine threshold crossing
 * causes a re-render.
 */
export function useScrolledPast(threshold: number) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        onStoreChange();
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
