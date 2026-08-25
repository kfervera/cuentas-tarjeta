import { describe, expect, it } from "vitest";
import { asignarCompleto, describirAsignacion } from "./asignacion";

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

describe("asignarCompleto", () => {
  it("asigna el monto completo a Kei y cero a Kev", () => {
    expect(asignarCompleto(100, "kei")).toEqual({ montoKei: 100, montoKev: 0 });
  });

  it("asigna el monto completo a Kev y cero a Kei", () => {
    expect(asignarCompleto(100, "kev")).toEqual({ montoKei: 0, montoKev: 100 });
  });

  it("funciona igual con montos negativos (pagos/abonos)", () => {
    expect(asignarCompleto(-50, "kei")).toEqual({ montoKei: -50, montoKev: 0 });
  });
});
