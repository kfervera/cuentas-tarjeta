import { describe, expect, it } from "vitest";
import { calcularRestante, excedeTotal } from "./split";

describe("calcularRestante", () => {
  it("calcula lo que falta para completar el total", () => {
    expect(calcularRestante(100, 60)).toBe(40);
  });

  it("redondea residuos de punto flotante a centavos", () => {
    expect(calcularRestante(100, 33.33)).toBe(66.67);
  });

  it("funciona con montos negativos (pagos/abonos)", () => {
    expect(calcularRestante(-100, -60)).toBe(-40);
  });
});

describe("excedeTotal", () => {
  it("no excede cuando el monto ingresado es exactamente el total", () => {
    expect(excedeTotal(100, 100)).toBe(false);
  });

  it("excede cuando el monto ingresado es mayor al total", () => {
    expect(excedeTotal(100, 100.01)).toBe(true);
  });

  it("acepta diferencias de redondeo menores a medio centavo", () => {
    expect(excedeTotal(100, 99.995)).toBe(false);
  });

  it("funciona con montos negativos (pagos/abonos)", () => {
    expect(excedeTotal(-100, -100)).toBe(false);
    expect(excedeTotal(-100, -150)).toBe(true);
  });
});
