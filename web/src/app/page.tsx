import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Cuentas KyK</h1>
      <p className={styles.subtitle}>
        La lista de transacciones para revisar y asignar gastos llega en la próxima fase.
      </p>
    </main>
  );
}
