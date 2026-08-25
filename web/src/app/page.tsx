"use client";

import { useTransacciones } from "@/hooks/useTransacciones";
import { TransaccionList } from "@/components/TransaccionList";
import styles from "./page.module.css";

export default function Home() {
  const { transacciones, cargando, error } = useTransacciones();

  if (cargando) {
    return <main className={styles.estado}>Cargando…</main>;
  }

  if (error) {
    return <main className={styles.estado}>{error}</main>;
  }

  return (
    <main className={styles.page}>
      <TransaccionList transacciones={transacciones} />
    </main>
  );
}
