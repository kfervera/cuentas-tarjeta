import type { Transaccion } from "../data/database.types";
import { MONTO_EPSILON } from "./epsilon";

export type Asignacion = "kei" | "kev" | "dividido";

// A quién está asignado el monto en este momento — ver requerimientos-web.md
// §5.1. Compara contra el monto total (no contra 0) para que funcione igual
// con montos negativos (pagos/abonos).
export function describirAsignacion(
  transaccion: Pick<Transaccion, "monto" | "monto_kei" | "monto_kev">,
): Asignacion {
  if (Math.abs(transaccion.monto_kei - transaccion.monto) < MONTO_EPSILON) return "kei";
  if (Math.abs(transaccion.monto_kev - transaccion.monto) < MONTO_EPSILON) return "kev";
  return "dividido";
}
