// Tipos generados a mano a partir de `pdf-parser/database-setup.md`.
// Si el esquema cambia, este archivo debe actualizarse (o regenerarse con
// `supabase gen types typescript`) para mantenerse en sincronía.

export type Moneda = "PEN" | "USD";

export type TipoTransaccion =
  "consumo" | "pago" | "cargo" | "interes" | "comision" | "saldo_anterior";

export type Titular = "KEI" | "KEVIN";

export type TipoRegla = "titular" | "comercio";

export interface Database {
  public: {
    Tables: {
      transacciones: {
        Row: {
          id: string;
          fecha_proceso: string | null;
          fecha_consumo: string | null;
          descripcion: string;
          ciudad: string | null;
          titular: Titular | null;
          tipo: TipoTransaccion;
          moneda: Moneda;
          monto: number;
          monto_original_valor: number | null;
          monto_original_moneda: string | null;
          monto_kei: number;
          monto_kev: number;
          regla_aplicada: string | null;
          confirmado: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          fecha_proceso?: string | null;
          fecha_consumo?: string | null;
          descripcion: string;
          ciudad?: string | null;
          titular?: Titular | null;
          tipo: TipoTransaccion;
          moneda: Moneda;
          monto: number;
          monto_original_valor?: number | null;
          monto_original_moneda?: string | null;
          monto_kei: number;
          monto_kev: number;
          regla_aplicada?: string | null;
          confirmado?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          fecha_proceso?: string | null;
          fecha_consumo?: string | null;
          descripcion?: string;
          ciudad?: string | null;
          titular?: Titular | null;
          tipo?: TipoTransaccion;
          moneda?: Moneda;
          monto?: number;
          monto_original_valor?: number | null;
          monto_original_moneda?: string | null;
          monto_kei?: number;
          monto_kev?: number;
          regla_aplicada?: string | null;
          confirmado?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      reglas: {
        Row: {
          id: string;
          tipo: TipoRegla;
          patron: string;
          kei_pct: number;
          kev_pct: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipo: TipoRegla;
          patron: string;
          kei_pct: number;
          kev_pct: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tipo?: TipoRegla;
          patron?: string;
          kei_pct?: number;
          kev_pct?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      resumen_estado_cuenta: {
        Row: {
          id: string;
          periodo_inicio: string | null;
          periodo_fin: string | null;
          monto_total_facturado_pen: number | null;
          monto_total_facturado_usd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          periodo_inicio?: string | null;
          periodo_fin?: string | null;
          monto_total_facturado_pen?: number | null;
          monto_total_facturado_usd?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          periodo_inicio?: string | null;
          periodo_fin?: string | null;
          monto_total_facturado_pen?: number | null;
          monto_total_facturado_usd?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// Alias de conveniencia para usar en lib/data y lib/logic sin repetir el
// camino completo hacia Database["public"]["Tables"][...].
export type Transaccion = Database["public"]["Tables"]["transacciones"]["Row"];
export type TransaccionUpdate = Database["public"]["Tables"]["transacciones"]["Update"];
export type ResumenEstadoCuenta = Database["public"]["Tables"]["resumen_estado_cuenta"]["Row"];
