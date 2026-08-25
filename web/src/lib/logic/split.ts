// Tolerancia de medio centavo para absorber errores de precisión de punto
// flotante al sumar montos (nunca vienen con más de 2 decimales).
const EPSILON = 0.005;

// El split parcial siempre se ingresa en montos exactos (nunca porcentaje) y
// debe sumar el monto total de la transacción — ver requerimientos-web.md §5.2.
export function validarSplit(monto: number, montoKei: number, montoKev: number): boolean {
  return Math.abs(montoKei + montoKev - monto) < EPSILON;
}
