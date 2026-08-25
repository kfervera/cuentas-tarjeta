import { ImageResponse } from "next/og";
import { monogramElement } from "../_brand/monogram";

export function GET() {
  return new ImageResponse(monogramElement(84), { width: 192, height: 192 });
}
