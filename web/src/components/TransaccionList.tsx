import type { Transaccion } from "@/lib/data/database.types";
import { TransaccionRow } from "./TransaccionRow";
import styles from "./TransaccionList.module.css";

export function TransaccionList({ transacciones }: { transacciones: Transaccion[] }) {
  if (transacciones.length === 0) {
    return <p className={styles.vacio}>No hay transacciones cargadas todavía.</p>;
  }

  return (
    <ul className={styles.list}>
      {transacciones.map((transaccion) => (
        <TransaccionRow key={transaccion.id} transaccion={transaccion} />
      ))}
    </ul>
  );
}
