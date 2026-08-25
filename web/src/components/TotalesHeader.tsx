import type { Moneda, Transaccion } from "@/lib/data/database.types";
import { calcularTotales } from "@/lib/logic/totales";
import { formatMonto } from "@/lib/format/monto";
import styles from "./TotalesHeader.module.css";

const MONEDAS: Moneda[] = ["PEN", "USD"];

export function TotalesHeader({ transacciones }: { transacciones: Transaccion[] }) {
  const totales = calcularTotales(transacciones);

  return (
    <header className={styles.header}>
      {MONEDAS.map((moneda) => (
        <section key={moneda} className={styles.moneda}>
          <h2 className={styles.titulo}>{moneda}</h2>
          <dl className={styles.totales}>
            <div className={styles.item}>
              <dt>General</dt>
              <dd>{formatMonto(totales[moneda].general, moneda)}</dd>
            </div>
            <div className={styles.item}>
              <dt>Kei</dt>
              <dd>{formatMonto(totales[moneda].kei, moneda)}</dd>
            </div>
            <div className={styles.item}>
              <dt>Kev</dt>
              <dd>{formatMonto(totales[moneda].kev, moneda)}</dd>
            </div>
          </dl>
        </section>
      ))}
    </header>
  );
}
