import type { ReactElement } from "react";

// Elemento compartido por los distintos tamaños de ícono generados con
// ImageResponse (favicon, icon-192, icon-512) — ver plan-web.md paso 1.6,
// decisión D3 (branding a cargo del Agente IA).
export function monogramElement(fontSize: number): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d9488",
        color: "#ffffff",
        fontSize,
        fontWeight: 700,
        fontFamily: "sans-serif",
        letterSpacing: -2,
      }}
    >
      KyK
    </div>
  );
}
