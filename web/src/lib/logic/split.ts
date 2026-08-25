import { MONTO_EPSILON } from "./epsilon";

// El split parcial siempre se ingresa en montos exactos (nunca porcentaje) —
// ver requerimientos-web.md §5.2. Al editar un campo, el modal completa el
// otro automáticamente con el restante (ver SplitModal), así que la validación
// necesaria es que un monto ingresado no supere el total de la transacción.

// Redondea a centavos para evitar residuos de punto flotante (ej. 39.99999999999997).
export function calcularRestante(monto: number, montoIngresado: number): number {
  return Math.round((monto - montoIngresado) * 100) / 100;
}

// Compara valores absolutos para funcionar igual con montos negativos (pagos/abonos).
export function excedeTotal(monto: number, montoIngresado: number): boolean {
  return Math.abs(montoIngresado) > Math.abs(monto) + MONTO_EPSILON;
}
