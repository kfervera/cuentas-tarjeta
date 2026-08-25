"use client";

import { useResumen } from "@/hooks/useResumen";
import { ResumenMoneda } from "@/components/ResumenMoneda";
import { calcularTotales } from "@/lib/logic/totales";
import { validarCuadre } from "@/lib/logic/cuadre";
import type { Moneda } from "@/lib/data/database.types";
import styles from "./page.module.css";

const MONEDAS: Moneda[] = ["PEN", "USD"];

export default function ResumenPage() {
  const { transacciones, resumen, cargando, error } = useResumen();

  if (cargando) {
    return <main className={styles.estado}>Cargando…</main>;
  }

  if (error) {
    return <main className={styles.estado}>{error}</main>;
  }

  const totales = calcularTotales(transacciones);

  return (
    <main className={styles.page}>
      {MONEDAS.map((moneda) => {
        const totalFacturado =
          moneda === "PEN"
            ? (resumen?.monto_total_facturado_pen ?? null)
            : (resumen?.monto_total_facturado_usd ?? null);

        return (
          <ResumenMoneda
            key={moneda}
            moneda={moneda}
            totales={totales[moneda]}
            totalFacturado={totalFacturado}
            cuadre={validarCuadre(totales[moneda].general, totalFacturado)}
          />
        );
      })}
    </main>
  );
}
