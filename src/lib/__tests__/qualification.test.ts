import { describe, expect, it } from "vitest";
import { formatFactValue, parseQualificationData, provenanceInfo } from "@/lib/qualification";
import { contactById } from "./fixtures";

describe("parseQualificationData", () => {
  it("agrupa por operación e ignora _meta (c-001)", () => {
    const { groups, parseError } = parseQualificationData(contactById("c-001").qualification_data);
    expect(parseError).toBe(false);
    expect(groups.map((g) => g.label)).toEqual(["Compra", "Datos compartidos"]);
    expect(groups[0].facts.map((f) => f.label)).toEqual(["Zona", "Presupuesto", "Habitaciones (mín.)", "Financiación", "Terraza"]);
  });

  it("parsea la cualificación que llega serializada como string JSON (c-003)", () => {
    const { groups, parseError } = parseQualificationData(contactById("c-003").qualification_data);
    expect(parseError).toBe(false);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Alquiler");
    expect(groups[0].facts.find((f) => f.key === "budget")?.fact.value).toBe(1400);
  });

  it("marca error si el string no es JSON válido", () => {
    expect(parseQualificationData("{qualification: roto")).toEqual({ groups: [], parseError: true });
  });

  it("devuelve vacío sin error cuando no hay datos (c-004)", () => {
    expect(parseQualificationData(contactById("c-004").qualification_data)).toEqual({ groups: [], parseError: false });
  });

  it("rescata los ingresos que viven fuera del bloque qualification (c-008)", () => {
    const { groups } = parseQualificationData(contactById("c-008").qualification_data);
    const financiero = groups.find((g) => g.operation === "financiero");
    expect(financiero?.facts[0].fact).toEqual({
      value: 3200,
      source: "declarado en llamada",
      updatedAt: "2026-07-05T11:26:00Z",
    });
  });

  it("los ingresos verificados se marcan como tales", () => {
    const { groups } = parseQualificationData({ net_income: 2000, income_verified: true });
    expect(groups[0].facts[0].fact.source).toBe("verificado");
  });

  it("humaniza claves desconocidas", () => {
    const { groups } = parseQualificationData({ qualification: { mixed_use: { piscina_comunitaria: { value: true } } } });
    expect(groups[0].label).toBe("Mixed use");
    expect(groups[0].facts[0].label).toBe("Piscina comunitaria");
  });
});

describe("formatFactValue", () => {
  it("formatea rangos de presupuesto como moneda", () => {
    expect(formatFactValue("budget", { max: 480000 })).toMatch(/^hasta 480\.000\s€$/);
    expect(formatFactValue("budget", { min: 300000 })).toMatch(/^desde 300\.000\s€$/);
    expect(formatFactValue("budget", { min: 300000, max: 400000 })).toMatch(/^entre 300\.000\s€ y 400\.000\s€$/);
  });

  it("formatea presupuestos numéricos sueltos (c-003)", () => {
    expect(formatFactValue("budget", 1400)).toMatch(/^1400\s€$/);
  });

  it("deja tal cual el presupuesto que ya viene como texto (c-002)", () => {
    expect(formatFactValue("budget", "1.100 €")).toBe("1.100 €");
  });

  it("formatea booleanos, listas, números y vacíos", () => {
    expect(formatFactValue("terrace", true)).toBe("Sí");
    expect(formatFactValue("terrace", false)).toBe("No");
    expect(formatFactValue("zones", ["Las Rozas", "Majadahonda"])).toBe("Las Rozas, Majadahonda");
    expect(formatFactValue("zones", "Las Rozas o Majadahonda")).toBe("Las Rozas o Majadahonda");
    expect(formatFactValue("bedrooms", 3)).toBe("3");
    expect(formatFactValue("x", null)).toBe("—");
  });

  it("no rompe ante objetos sin forma de rango", () => {
    expect(formatFactValue("raro", { a: 1 })).toBe('{"a":1}');
  });
});

describe("provenanceInfo", () => {
  it.each([
    ["manual", "human"],
    ["verificado", "human"],
    ["import-witei", "import"],
    ["explicit", "ai"],
    ["declarado en llamada", "unknown"],
    [undefined, "unknown"],
  ] as const)("%s → %s", (source, kind) => {
    expect(provenanceInfo(source).kind).toBe(kind);
  });
});
