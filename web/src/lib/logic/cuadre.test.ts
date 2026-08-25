import { describe, expect, it } from "vitest";
import { validarCuadre } from "./cuadre";

describe("validarCuadre", () => {
  it("devuelve null cuando no hay total facturado de referencia", () => {
    expect(validarCuadre(100, null)).toBeNull();
  });

  it("cuadra cuando la suma coincide exactamente con el total facturado", () => {
    expect(validarCuadre(100, 100)).toEqual({ cuadra: true, diferencia: 0 });
  });

  it("cuadra con diferencias de redondeo menores a medio centavo", () => {
    const resultado = validarCuadre(99.995, 100);
    expect(resultado?.cuadra).toBe(true);
  });

  it("no cuadra cuando hay una diferencia real y reporta el monto", () => {
    expect(validarCuadre(90, 100)).toEqual({ cuadra: false, diferencia: -10 });
  });
});
