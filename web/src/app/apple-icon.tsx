import { ImageResponse } from "next/og";
import { monogramElement } from "./_brand/monogram";

// iOS no lee los íconos del manifest para "Agregar a pantalla de inicio" —
// necesita su propio apple-touch-icon (hallazgo paso 5.1, ajuste 5.2).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(monogramElement(79), size);
}
