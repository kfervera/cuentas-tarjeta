// Misma tolerancia que split.ts: absorbe errores de punto flotante al sumar
// montos con 2 decimales, sin ocultar diferencias reales de extracción.
const EPSILON = 0.005;

export interface ResultadoCuadre {
  cuadra: boolean;
  diferencia: number;
}

// Compara la suma de transacciones de una moneda contra el total facturado
// del PDF (resumen_estado_cuenta) — ver requerimientos-web.md §5.3 y
// pdf-parser/database-setup.md "Cuadre de validación". `null` cuando no hay
// total de referencia todavía (no es un error, no hay nada que validar).
export function validarCuadre(
  sumaTransacciones: number,
  totalFacturado: number | null,
): ResultadoCuadre | null {
  if (totalFacturado === null) return null;

  const diferencia = sumaTransacciones - totalFacturado;
  return { cuadra: Math.abs(diferencia) < EPSILON, diferencia };
}
