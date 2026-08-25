"use client";

import { useEffect } from "react";

// Registro básico, sin caché offline funcional (ver plan-web.md D2) — solo
// para que Chrome/Android considere la app instalable (paso 1.7).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
