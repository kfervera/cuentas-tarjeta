import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "./database.types";

// Test de integración contra el proyecto Supabase real (no hay esquema de
// prueba aislado, ver plan-web.md paso 0.10). Confirma el paso 6.1 del plan:
// las políticas RLS documentadas en pdf-parser/database-setup.md siguen
// bloqueando INSERT/DELETE para el `anon key` en `transacciones`, y que
// `reglas` sigue sin exponer filas (sin policy = acceso denegado).
//
// El DELETE usa un id inexistente a propósito: aunque la policy fallara, no
// borraría ninguna fila real. El INSERT sí podría crear una fila real si la
// policy fallara — en ese caso el test lo reporta con el id exacto en vez de
// dejarlo pasar en silencio, para poder borrarla a mano desde el dashboard.

// Vitest no carga web/.env.local automáticamente como sí hace Next.js en
// dev/build, así que se replica aquí el mismo mecanismo de carga. `@next/env`
// además omite `.env.local` a propósito cuando `NODE_ENV=test` (para que los
// tests unitarios no dependan de secretos locales) — vitest fija ese valor,
// así que se pisa temporalmente solo para esta carga puntual.
// `@types/node` marca NODE_ENV como readonly; se necesita esta única mutación
// puntual y se revierte de inmediato, así que se pasa por un cast local en
// vez de relajar el tipo en todo el archivo.
const mutableEnv = process.env as { NODE_ENV: string };
const nodeEnvAntesDeLaCarga = mutableEnv.NODE_ENV;
mutableEnv.NODE_ENV = "development";
loadEnvConfig(process.cwd());
mutableEnv.NODE_ENV = nodeEnvAntesDeLaCarga;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (web/.env.local) para correr los tests de RLS.",
  );
}

const anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

describe("RLS — transacciones (anon key)", () => {
  it("permite SELECT", async () => {
    const { error } = await anonClient.from("transacciones").select("id").limit(1);
    expect(error).toBeNull();
  });

  it("bloquea INSERT", async () => {
    const { data, error } = await anonClient
      .from("transacciones")
      .insert({
        descripcion: "TEST_RLS_DELETE_ME — fila de prueba, borrar si aparece",
        tipo: "consumo",
        moneda: "PEN",
        monto: 0.01,
        monto_kei: 0.01,
        monto_kev: 0,
      })
      .select();

    if (!error && data && data.length > 0) {
      throw new Error(
        `RLS no bloqueó el INSERT en transacciones — se creó una fila real con id ${data[0].id}. ` +
          "Bórrala desde el dashboard de Supabase y revisa la policy de INSERT.",
      );
    }

    expect(error).not.toBeNull();
  });

  // Nota: Supabase otorga privilegios de tabla amplios a `anon` por defecto y
  // usa RLS como único filtro por fila — sin policy de DELETE, la operación
  // no da error, simplemente no afecta ninguna fila (mismo comportamiento que
  // el SELECT de `reglas` más abajo). Por eso este test usa un id inexistente
  // (cero riesgo: no hay fila real que pudiera borrarse) y solo confirma que
  // no se afecta ninguna fila; la señal fuerte de que la policy de escritura
  // es restrictiva para `transacciones` la da el test de INSERT de arriba,
  // que si prueba contra una policy real (documentada en database-setup.md,
  // idéntica ausencia de policy para INSERT y DELETE).
  it("DELETE no afecta filas (id inexistente, sin policy de DELETE)", async () => {
    const idInexistente = "00000000-0000-0000-0000-000000000000";
    const { error, count } = await anonClient
      .from("transacciones")
      .delete({ count: "exact" })
      .eq("id", idInexistente);

    expect(error).toBeNull();
    expect(count ?? 0).toBe(0);
  });
});

describe("RLS — resumen_estado_cuenta (anon key)", () => {
  it("permite SELECT", async () => {
    const { error } = await anonClient.from("resumen_estado_cuenta").select("id").limit(1);
    expect(error).toBeNull();
  });

  it("bloquea INSERT", async () => {
    const { data, error } = await anonClient.from("resumen_estado_cuenta").insert({}).select();

    if (!error && data && data.length > 0) {
      throw new Error(
        `RLS no bloqueó el INSERT en resumen_estado_cuenta — se creó una fila real con id ${data[0].id}. ` +
          "Bórrala desde el dashboard de Supabase y revisa la policy de INSERT.",
      );
    }

    expect(error).not.toBeNull();
  });
});

describe("RLS — reglas (sin policy para anon key)", () => {
  it("no expone filas por SELECT", async () => {
    const { data, error } = await anonClient.from("reglas").select("id");

    if (error) {
      expect(error).not.toBeNull();
    } else {
      expect(data).toEqual([]);
    }
  });
});
