"use client";

import { useEffect, useState } from "react";
import { getTransacciones } from "@/lib/data/transacciones";
import type { Transaccion } from "@/lib/data/database.types";

interface UseTransaccionesResult {
  transacciones: Transaccion[];
  cargando: boolean;
  error: string | null;
}

export function useTransacciones(): UseTransaccionesResult {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { transacciones, cargando, error };
}
