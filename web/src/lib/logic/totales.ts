import type { Moneda, Transaccion } from "../data/database.types";

export interface TotalesPorMoneda {
  general: number;
  kei: number;
  kev: number;
}

export type TotalesPorMonedaYPersona = Record<Moneda, TotalesPorMoneda>;

// Recalcula los totales sobre las asignaciones actuales (monto_kei/monto_kev),
// no sobre la sugerencia inicial del skill — ver requerimientos-web.md §5.1.
export function calcularTotales(transacciones: Transaccion[]): TotalesPorMonedaYPersona {
  const totales: TotalesPorMonedaYPersona = {
    PEN: { general: 0, kei: 0, kev: 0 },
    USD: { general: 0, kei: 0, kev: 0 },
  };

  for (const transaccion of transacciones) {
    const totalMoneda = totales[transaccion.moneda];
    totalMoneda.general += transaccion.monto;
    totalMoneda.kei += transaccion.monto_kei;
    totalMoneda.kev += transaccion.monto_kev;
  }

  return totales;
}
