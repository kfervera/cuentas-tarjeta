import type { Moneda } from "../data/database.types";

const FORMATTERS: Record<Moneda, Intl.NumberFormat> = {
  PEN: new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }),
  USD: new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" }),
};

export function formatMonto(monto: number, moneda: Moneda): string {
  return FORMATTERS[moneda].format(monto);
}
