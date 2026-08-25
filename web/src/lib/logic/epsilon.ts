// Tolerancia de medio centavo para comparar montos de dinero (nunca vienen
// con más de 2 decimales) sin que errores de punto flotante los hagan fallar.
// Compartida por split.ts, cuadre.ts y asignacion.ts.
export const MONTO_EPSILON = 0.005;
