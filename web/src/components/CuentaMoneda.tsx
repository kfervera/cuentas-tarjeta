"use client";

import { useCuenta } from "@/hooks/useCuenta";
import { ResumenMoneda } from "./ResumenMoneda";
import { TransaccionList } from "./TransaccionList";
import { calcularTotales } from "@/lib/logic/totales";
import { validarCuadre } from "@/lib/logic/cuadre";
import type { Moneda } from "@/lib/data/database.types";
import styles from "./CuentaMoneda.module.css";

interface CuentaMonedaProps {
  moneda: Moneda;
}

export function CuentaMoneda({ moneda }: CuentaMonedaProps) {
  const { transacciones, resumen, cargando, error, accionError, actualizarAsignacion } = useCuenta();

  if (cargando) {
    return <main className={styles.estado}>Cargando…</main>;
  }

  if (error) {
    return <main className={styles.estado}>{error}</main>;
  }

  const transaccionesMoneda = transacciones.filter((t) => t.moneda === moneda);
  const totales = calcularTotales(transacciones)[moneda];
  const totalFacturado =
    moneda === "PEN"
      ? (resumen?.monto_total_facturado_pen ?? null)
      : (resumen?.monto_total_facturado_usd ?? null);

  return (
    <main className={styles.page}>
      <ResumenMoneda
        moneda={moneda}
        totales={totales}
        totalFacturado={totalFacturado}
        cuadre={validarCuadre(totales.general, totalFacturado)}
      />
      {accionError && (
        <p className={styles.accionError} role="alert">
          {accionError}
        </p>
      )}
      <div className={styles.scroll}>
        <TransaccionList transacciones={transaccionesMoneda} onAsignar={actualizarAsignacion} />
      </div>
    </main>
  );
}
