"use client";

import { useEffect } from "react";

export const PwaRegister: React.FC = () => {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[VESSEL PWA] Service Worker registrado con éxito:", registration.scope);
          })
          .catch((error) => {
            console.warn("[VESSEL PWA] Error registrando Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
};
