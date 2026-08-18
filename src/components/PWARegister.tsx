"use client";

import { useEffect } from "react";

/**
 * Registers the OmniVault/Tria service worker so the app is
 * installable as a PWA and gains offline app-shell caching.
 *
 * Registration runs in production builds (and `next start`), matching
 * how the deployed site behaves. It is intentionally skipped in `next dev`
 * to avoid stale-cache confusion during development.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Surface new versions via a console hint (no auto-update UX needed).
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.info("[PWA] A new version of Tria is available.");
              }
            });
          }
        });
      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error);
      }
    };

    register();
  }, []);

  return null;
}
