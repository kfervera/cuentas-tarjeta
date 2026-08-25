import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Transaccion } from "@/lib/data/database.types";
import { formatFecha } from "@/lib/format/fecha";
import { formatMonto } from "@/lib/format/monto";
import { asignarCompleto, describirAsignacion, type Asignacion } from "@/lib/logic/asignacion";
import { SplitModal } from "./SplitModal";
import styles from "./TransaccionRow.module.css";

const ETIQUETA_ASIGNACION: Record<Asignacion, string> = {
  kei: "Kei",
  kev: "Kev",
  dividido: "Dividido",
};

// Distancia mínima para que un swipe cuente como asignación (no un roce
// accidental) y desplazamiento máximo permitido durante el arrastre — ver
// requerimientos-web.md §5.2.
const UMBRAL_SWIPE_PX = 72;
const MAX_DRAG_PX = 120;
// Movimiento mínimo antes de decidir si el gesto es horizontal (swipe) o
// vertical (scroll de la página).
const UMBRAL_EJE_PX = 8;

interface TransaccionRowProps {
  transaccion: Transaccion;
  onAsignar: (id: string, montoKei: number, montoKev: number) => Promise<boolean>;
}

export function TransaccionRow({ transaccion, onAsignar }: TransaccionRowProps) {
  const [offset, setOffset] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const eje = useRef<"horizontal" | "vertical" | null>(null);

  const asignacion = describirAsignacion(transaccion);
  const esPago = transaccion.tipo === "pago";

  const rowClass = [styles.row, esPago && styles.pago, transaccion.confirmado && styles.confirmado]
    .filter(Boolean)
    .join(" ");
  const montoClass = [styles.monto, esPago && styles.montoPago].filter(Boolean).join(" ");

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    inicio.current = { x: e.clientX, y: e.clientY };
    eje.current = null;
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!inicio.current) return;
    const dx = e.clientX - inicio.current.x;
    const dy = e.clientY - inicio.current.y;

    if (!eje.current) {
      if (Math.abs(dx) < UMBRAL_EJE_PX && Math.abs(dy) < UMBRAL_EJE_PX) return;
      eje.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      if (eje.current === "horizontal") {
        e.currentTarget.setPointerCapture(e.pointerId);
        setArrastrando(true);
      }
    }

    if (eje.current !== "horizontal") return;
    e.preventDefault();
    setOffset(Math.max(-MAX_DRAG_PX, Math.min(MAX_DRAG_PX, dx)));
  }

  function handlePointerUp() {
    if (eje.current === "horizontal") {
      if (Math.abs(offset) >= UMBRAL_SWIPE_PX) {
        const persona = offset > 0 ? "kei" : "kev";
        const { montoKei, montoKev } = asignarCompleto(transaccion.monto, persona);
        onAsignar(transaccion.id, montoKei, montoKev);
      }
    } else if (inicio.current && eje.current === null) {
      setModalAbierto(true);
    }
    setOffset(0);
    setArrastrando(false);
    inicio.current = null;
    eje.current = null;
  }

  function handlePointerCancel() {
    setOffset(0);
    setArrastrando(false);
    inicio.current = null;
    eje.current = null;
  }

  return (
    <li className={styles.rowWrapper}>
      <div className={styles.fondo} aria-hidden="true">
        <span className={styles.fondoLabel}>Kei</span>
        <span className={styles.fondoLabel}>Kev</span>
      </div>
      <div
        className={rowClass}
        style={{
          transform: `translateX(${offset}px)`,
          transition: arrastrando ? "none" : "transform 0.2s ease",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
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
      </div>

      {modalAbierto && (
        <SplitModal
          transaccion={transaccion}
          onCancelar={() => setModalAbierto(false)}
          onGuardar={async (montoKei, montoKev) => {
            const ok = await onAsignar(transaccion.id, montoKei, montoKev);
            if (ok) setModalAbierto(false);
            return ok;
          }}
        />
      )}
    </li>
  );
}
