import { supabase } from "./supabaseClient";
import type { Transaccion } from "./database.types";

export async function getTransacciones(): Promise<Transaccion[]> {
  const { data, error } = await supabase
    .from("transacciones")
    .select("*")
    .order("fecha_consumo", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateAsignacion(
  id: string,
  montoKei: number,
  montoKev: number,
): Promise<void> {
  const { error } = await supabase
    .from("transacciones")
    .update({ monto_kei: montoKei, monto_kev: montoKev, confirmado: true })
    .eq("id", id);

  if (error) throw error;
}
