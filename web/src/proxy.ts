import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Portón de acceso compartido (Basic Auth), no un sistema de autenticación de
// usuarios — ver plan-web.md decisión D6. Las credenciales viven solo en
// variables de entorno server-side (BASIC_AUTH_USER/PASSWORD).

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function unauthorized(): NextResponse {
  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Cuentas KyK"' },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    throw new Error("Faltan las variables de entorno BASIC_AUTH_USER y/o BASIC_AUTH_PASSWORD.");
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  const decoded = Buffer.from(authHeader.slice("Basic ".length), "base64").toString("utf-8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return unauthorized();
  }

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  if (!safeEqual(user, expectedUser) || !safeEqual(password, expectedPassword)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  // Corre en todas las rutas salvo assets estáticos internos de Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
