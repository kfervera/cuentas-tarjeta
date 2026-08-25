import { describe, expect, it } from "vitest";
import { validarSplit } from "./split";

describe("validarSplit", () => {
  it("acepta un split cuyos montos suman exactamente el total", () => {
    expect(validarSplit(100, 60, 40)).toBe(true);
  });

  it("acepta diferencias de redondeo menores a medio centavo", () => {
    expect(validarSplit(100, 33.33, 66.67)).toBe(true);
  });

  it("rechaza un split que no suma el total", () => {
    expect(validarSplit(100, 60, 30)).toBe(false);
  });

  it("acepta 100% a una sola persona con el otro monto en cero", () => {
    expect(validarSplit(100, 100, 0)).toBe(true);
    expect(validarSplit(100, 0, 100)).toBe(true);
  });
});
