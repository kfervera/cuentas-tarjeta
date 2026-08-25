import { ImageResponse } from "next/og";
import { monogramElement } from "../_brand/monogram";

export function GET() {
  return new ImageResponse(monogramElement(224), { width: 512, height: 512 });
}
