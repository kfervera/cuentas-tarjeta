import type { Moneda } from "@/lib/data/database.types";
import type { ResultadoCuadre } from "@/lib/logic/cuadre";
import type { TotalesPorMoneda } from "@/lib/logic/totales";
import { formatMonto } from "@/lib/format/monto";
import styles from "./ResumenMoneda.module.css";

interface ResumenMonedaProps {
  moneda: Moneda;
  totales: TotalesPorMoneda;
  totalFacturado: number | null;
  cuadre: ResultadoCuadre | null;
}

export function ResumenMoneda({ moneda, totales, totalFacturado, cuadre }: ResumenMonedaProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.titulo}>{moneda}</h2>
      <dl className={styles.totales}>
        <div className={styles.item}>
          <dt>General</dt>
          <dd>{formatMonto(totales.general, moneda)}</dd>
        </div>
        <div className={styles.item}>
          <dt>Kei</dt>
          <dd>{formatMonto(totales.kei, moneda)}</dd>
        </div>
        <div className={styles.item}>
          <dt>Kev</dt>
          <dd>{formatMonto(totales.kev, moneda)}</dd>
        </div>
        {totalFacturado !== null && (
          <div className={`${styles.item} ${styles.referencia}`}>
            <dt>Total facturado (PDF)</dt>
            <dd>{formatMonto(totalFacturado, moneda)}</dd>
          </div>
        )}
      </dl>
      {cuadre && !cuadre.cuadra && (
        <p className={styles.alerta} role="alert">
          No cuadra: la suma de transacciones difiere del total facturado por{" "}
          {formatMonto(cuadre.diferencia, moneda)}.
        </p>
      )}
    </section>
  );
}
