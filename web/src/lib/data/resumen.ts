import { supabase } from "./supabaseClient";
import type { ResumenEstadoCuenta } from "./database.types";

// El skill borra y regenera `resumen_estado_cuenta` en cada corrida, así que
// solo existe una fila vigente (o ninguna si nunca se cargó un estado de
// cuenta) — ver pdf-parser/database-setup.md.
export async function getResumenEstadoCuenta(): Promise<ResumenEstadoCuenta | null> {
  const { data, error } = await supabase.from("resumen_estado_cuenta").select("*").maybeSingle();

  if (error) throw error;
  return data;
}
