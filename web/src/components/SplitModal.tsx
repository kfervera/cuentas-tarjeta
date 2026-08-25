import { useEffect, useState } from "react";
import type { Transaccion } from "@/lib/data/database.types";
import { formatMonto } from "@/lib/format/monto";
import { calcularRestante, excedeTotal } from "@/lib/logic/split";
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
  const keiExcede = Number.isFinite(montoKei) && excedeTotal(transaccion.monto, montoKei);
  const kevExcede = Number.isFinite(montoKev) && excedeTotal(transaccion.monto, montoKev);
  const esValido =
    Number.isFinite(montoKei) && Number.isFinite(montoKev) && !keiExcede && !kevExcede;

  // Al perder el foco, el otro campo se completa con lo que falta para el
  // total — evita que el usuario tenga que calcular el resto a mano.
  function handleBlurKei() {
    if (!Number.isFinite(montoKei)) return;
    setMontoKevTexto(String(calcularRestante(transaccion.monto, montoKei)));
  }

  function handleBlurKev() {
    if (!Number.isFinite(montoKev)) return;
    setMontoKeiTexto(String(calcularRestante(transaccion.monto, montoKev)));
  }

  function handleMitad() {
    const mitad = Math.round((transaccion.monto / 2) * 100) / 100;
    setMontoKeiTexto(String(mitad));
    setMontoKevTexto(String(calcularRestante(transaccion.monto, mitad)));
  }

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
              onBlur={handleBlurKei}
              aria-invalid={keiExcede}
              className={keiExcede ? styles.inputInvalido : undefined}
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
              onBlur={handleBlurKev}
              aria-invalid={kevExcede}
              className={kevExcede ? styles.inputInvalido : undefined}
            />
          </div>
        </div>

        {(keiExcede || kevExcede) && (
          <p className={styles.errorSplit}>
            El monto no puede superar el total de {formatMonto(transaccion.monto, transaccion.moneda)}.
          </p>
        )}
        {error && <p className={styles.errorAccion}>{error}</p>}

        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.mitad}
            onClick={handleMitad}
            disabled={guardando}
          >
            50/50
          </button>
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
