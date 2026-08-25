import { describe, expect, it } from "vitest";
import { formatMonto } from "./monto";

// Intl.NumberFormat separa el símbolo/código de moneda del número con un
// espacio de no separación (U+00A0), no un espacio regular.
const NBSP = " ";

describe("formatMonto", () => {
  it("formatea PEN con el símbolo de soles", () => {
    expect(formatMonto(1234.5, "PEN")).toBe(`S/${NBSP}1,234.50`);
  });

  it("formatea USD con el código de moneda (es-PE no es locale de EE.UU.)", () => {
    expect(formatMonto(20, "USD")).toBe(`USD${NBSP}20.00`);
  });

  it("conserva el signo negativo de los pagos/abonos", () => {
    expect(formatMonto(-30, "PEN")).toBe(`-S/${NBSP}30.00`);
  });
});
