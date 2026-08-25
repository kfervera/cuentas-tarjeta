import { MONTO_EPSILON } from "./epsilon";

// El split parcial siempre se ingresa en montos exactos (nunca porcentaje) y
// debe sumar el monto total de la transacción — ver requerimientos-web.md §5.2.
export function validarSplit(monto: number, montoKei: number, montoKev: number): boolean {
  return Math.abs(montoKei + montoKev - monto) < MONTO_EPSILON;
}
