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
  const esPago = transaccion.tipo === "pago";

  const rowClass = [styles.row, esPago && styles.pago, transaccion.confirmado && styles.confirmado]
    .filter(Boolean)
    .join(" ");
  const montoClass = [styles.monto, esPago && styles.montoPago].filter(Boolean).join(" ");

  return (
    <li className={rowClass}>
      <div className={styles.info}>
        <span className={styles.descripcionLinea}>
          {esPago && <span className={styles.badgePago}>Abono</span>}
          <span className={styles.descripcion}>{transaccion.descripcion}</span>
        </span>
        <span className={styles.fecha}>{formatFecha(transaccion.fecha_consumo)}</span>
      </div>
      <div className={styles.detalle}>
        <span className={montoClass}>{formatMonto(transaccion.monto, transaccion.moneda)}</span>
        <span className={styles.asignacion}>
          {!transaccion.confirmado && <span className={styles.dotPendiente} aria-hidden="true" />}
          {ETIQUETA_ASIGNACION[asignacion]}
        </span>
      </div>
    </li>
  );
}
