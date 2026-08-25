import { describe, expect, it } from "vitest";
import { calcularTotales } from "./totales";
import type { Transaccion } from "../data/database.types";

function crearTransaccion(overrides: Partial<Transaccion>): Transaccion {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    fecha_proceso: null,
    fecha_consumo: null,
    descripcion: "Transacción de prueba",
    ciudad: null,
    titular: null,
    tipo: "consumo",
    moneda: "PEN",
    monto: 0,
    monto_original_valor: null,
    monto_original_moneda: null,
    monto_kei: 0,
    monto_kev: 0,
    regla_aplicada: null,
    confirmado: false,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("calcularTotales", () => {
  it("devuelve ceros para las dos monedas cuando no hay transacciones", () => {
    const totales = calcularTotales([]);

    expect(totales.PEN).toEqual({ general: 0, kei: 0, kev: 0 });
    expect(totales.USD).toEqual({ general: 0, kei: 0, kev: 0 });
  });

  it("suma por moneda y por persona según monto_kei/monto_kev, no la sugerencia inicial", () => {
    const transacciones = [
      crearTransaccion({ moneda: "PEN", monto: 100, monto_kei: 100, monto_kev: 0 }),
      crearTransaccion({ moneda: "PEN", monto: 50, monto_kei: 0, monto_kev: 50 }),
      crearTransaccion({ moneda: "USD", monto: 20, monto_kei: 10, monto_kev: 10 }),
    ];

    const totales = calcularTotales(transacciones);

    expect(totales.PEN).toEqual({ general: 150, kei: 100, kev: 50 });
    expect(totales.USD).toEqual({ general: 20, kei: 10, kev: 10 });
  });

  it("incluye montos negativos (pagos/abonos) en la suma general", () => {
    const transacciones = [
      crearTransaccion({ moneda: "PEN", monto: 100, monto_kei: 50, monto_kev: 50 }),
      crearTransaccion({
        moneda: "PEN",
        tipo: "pago",
        monto: -30,
        monto_kei: -15,
        monto_kev: -15,
      }),
    ];

    const totales = calcularTotales(transacciones);

    expect(totales.PEN).toEqual({ general: 70, kei: 35, kev: 35 });
  });
});
