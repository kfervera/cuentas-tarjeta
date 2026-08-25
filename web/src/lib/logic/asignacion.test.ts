import { describe, expect, it } from "vitest";
import { describirAsignacion } from "./asignacion";

describe("describirAsignacion", () => {
  it("devuelve kei cuando todo el monto está asignado a Kei", () => {
    expect(describirAsignacion({ monto: 100, monto_kei: 100, monto_kev: 0 })).toBe("kei");
  });

  it("devuelve kev cuando todo el monto está asignado a Kev", () => {
    expect(describirAsignacion({ monto: 100, monto_kei: 0, monto_kev: 100 })).toBe("kev");
  });

  it("devuelve dividido cuando el monto está repartido entre ambos", () => {
    expect(describirAsignacion({ monto: 100, monto_kei: 60, monto_kev: 40 })).toBe("dividido");
  });

  it("funciona igual con montos negativos (pagos/abonos)", () => {
    expect(describirAsignacion({ monto: -50, monto_kei: -50, monto_kev: 0 })).toBe("kei");
    expect(describirAsignacion({ monto: -50, monto_kei: -25, monto_kev: -25 })).toBe("dividido");
  });
});
