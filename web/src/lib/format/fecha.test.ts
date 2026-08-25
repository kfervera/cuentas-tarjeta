import { describe, expect, it } from "vitest";
import { formatFecha } from "./fecha";

describe("formatFecha", () => {
  it("devuelve un guion largo cuando no hay fecha", () => {
    expect(formatFecha(null)).toBe("—");
  });

  it("formatea día y mes sin depender de husos horarios", () => {
    expect(formatFecha("2026-01-01")).toBe("1 ene");
    expect(formatFecha("2026-08-25")).toBe("25 ago");
    expect(formatFecha("2026-12-31")).toBe("31 dic");
  });
});
