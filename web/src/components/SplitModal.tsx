import { useEffect, useState } from "react";
import type { Transaccion } from "@/lib/data/database.types";
import { formatMonto } from "@/lib/format/monto";
import { validarSplit } from "@/lib/logic/split";
import styles from "./SplitModal.module.css";

interface SplitModalProps {
  transaccion: Transaccion;
  onCancelar: () => void;
  onGuardar: (montoKei: number, montoKev: number) => Promise<boolean>;
}

export function SplitModal({ transaccion, onCancelar, onGuardar }: SplitModalProps) {
  const [montoKeiTexto, setMontoKeiTexto] = useState(String(transaccion.monto_kei));
  const [montoKevTexto, setMontoKevTexto] = useState(String(transaccion.monto_kev));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelar();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancelar]);

  const montoKei = Number.parseFloat(montoKeiTexto);
  const montoKev = Number.parseFloat(montoKevTexto);
  const esValido =
    Number.isFinite(montoKei) &&
    Number.isFinite(montoKev) &&
    validarSplit(transaccion.monto, montoKei, montoKev);

  async function handleGuardar() {
    if (!esValido || guardando) return;
    setGuardando(true);
    setError(null);
    const ok = await onGuardar(montoKei, montoKev);
    setGuardando(false);
    if (!ok) {
      setError("No se pudo guardar la asignación. Intenta de nuevo.");
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancelar}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Split parcial"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.titulo}>Asignar split parcial</h2>
        <p className={styles.descripcion}>
          {transaccion.descripcion} —{" "}
          <span className={styles.monto}>{formatMonto(transaccion.monto, transaccion.moneda)}</span>
        </p>

        <div className={styles.campos}>
          <div className={`${styles.campo} ${styles.campoKei}`}>
            <label htmlFor="monto-kei">Kei</label>
            <input
              id="monto-kei"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={montoKeiTexto}
              onChange={(e) => setMontoKeiTexto(e.target.value)}
            />
          </div>
          <div className={`${styles.campo} ${styles.campoKev}`}>
            <label htmlFor="monto-kev">Kev</label>
            <input
              id="monto-kev"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={montoKevTexto}
              onChange={(e) => setMontoKevTexto(e.target.value)}
            />
          </div>
        </div>

        {!esValido && (
          <p className={styles.errorSplit}>
            Kei + Kev debe sumar {formatMonto(transaccion.monto, transaccion.moneda)}.
          </p>
        )}
        {error && <p className={styles.errorAccion}>{error}</p>}

        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.cancelar}
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.guardar}
            onClick={handleGuardar}
            disabled={!esValido || guardando}
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
