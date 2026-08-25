import type { Transaccion } from "@/lib/data/database.types";
import { formatFecha } from "@/lib/format/fecha";
import { formatMonto } from "@/lib/format/monto";
import { describirAsignacion, type Asignacion } from "@/lib/logic/asignacion";
import styles from "./TransaccionRow.module.css";

const ETIQUETA_ASIGNACION: Record<Asignacion, string> = {
  kei: "Kei",
  kev: "Kev",
  dividido: "Dividido",
};

export function TransaccionRow({ transaccion }: { transaccion: Transaccion }) {
  const asignacion = describirAsignacion(transaccion);

  return (
    <li className={styles.row}>
      <div className={styles.info}>
        <span className={styles.descripcion}>{transaccion.descripcion}</span>
        <span className={styles.fecha}>{formatFecha(transaccion.fecha_consumo)}</span>
      </div>
      <div className={styles.detalle}>
        <span className={styles.monto}>{formatMonto(transaccion.monto, transaccion.moneda)}</span>
        <span className={styles.asignacion}>{ETIQUETA_ASIGNACION[asignacion]}</span>
      </div>
    </li>
  );
}
