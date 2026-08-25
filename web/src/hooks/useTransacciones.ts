"use client";

import { useCallback, useEffect, useState } from "react";
import { getTransacciones, updateAsignacion } from "@/lib/data/transacciones";
import type { Transaccion } from "@/lib/data/database.types";

interface UseTransaccionesResult {
  transacciones: Transaccion[];
  cargando: boolean;
  error: string | null;
  accionError: string | null;
  actualizarAsignacion: (id: string, montoKei: number, montoKev: number) => Promise<boolean>;
}

export function useTransacciones(): UseTransaccionesResult {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    getTransacciones()
      .then((data) => {
        if (!cancelado) setTransacciones(data);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudieron cargar las transacciones.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Actualiza de forma optimista (la UI refleja el cambio de inmediato) y
  // revierte al valor anterior si el `update` en Supabase falla — ver
  // plan-web.md paso 3.4.
  const actualizarAsignacion = useCallback(
    async (id: string, montoKei: number, montoKev: number): Promise<boolean> => {
      let anterior: Transaccion | undefined;

      setTransacciones((actuales) =>
        actuales.map((t) => {
          if (t.id !== id) return t;
          anterior = t;
          return { ...t, monto_kei: montoKei, monto_kev: montoKev, confirmado: true };
        }),
      );
      setAccionError(null);

      try {
        await updateAsignacion(id, montoKei, montoKev);
        return true;
      } catch {
        if (anterior) {
          const valorAnterior = anterior;
          setTransacciones((actuales) => actuales.map((t) => (t.id === id ? valorAnterior : t)));
        }
        setAccionError("No se pudo guardar la asignación. Intenta de nuevo.");
        return false;
      }
    },
    [],
  );

  return { transacciones, cargando, error, accionError, actualizarAsignacion };
}
