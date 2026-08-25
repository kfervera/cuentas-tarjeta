"use client";

import { useEffect, useState } from "react";
import { getTransacciones } from "@/lib/data/transacciones";
import { getResumenEstadoCuenta } from "@/lib/data/resumen";
import type { ResumenEstadoCuenta, Transaccion } from "@/lib/data/database.types";

interface UseResumenResult {
  transacciones: Transaccion[];
  resumen: ResumenEstadoCuenta | null;
  cargando: boolean;
  error: string | null;
}

export function useResumen(): UseResumenResult {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [resumen, setResumen] = useState<ResumenEstadoCuenta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([getTransacciones(), getResumenEstadoCuenta()])
      .then(([transaccionesData, resumenData]) => {
        if (cancelado) return;
        setTransacciones(transaccionesData);
        setResumen(resumenData);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar el resumen.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { transacciones, resumen, cargando, error };
}
