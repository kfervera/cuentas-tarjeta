import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

// Cliente único con el `anon key`, acotado por políticas RLS (ver
// pdf-parser/database-setup.md y plan-web.md §1 "Seguridad"). Nunca debe
// crearse aquí un cliente con el `service_role key`.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
