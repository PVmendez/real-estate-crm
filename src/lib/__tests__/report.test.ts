import { describe, expect, it } from "vitest";
import { buildNormalizationReport, type FieldKey, type NormalizationRow } from "@/lib/report";
import { allContacts, contactById } from "./fixtures";

function row(id: string, field: FieldKey): NormalizationRow {
  const found = buildNormalizationReport(contactById(id)).rows.find((r) => r.field === field);
  if (!found) throw new Error(`Sin fila ${field}`);
  return found;
}

describe("buildNormalizationReport", () => {
  it("genera las seis filas en orden para todos los contactos del dataset", () => {
    for (const contact of allContacts) {
      expect(buildNormalizationReport(contact).rows.map((r) => r.field)).toEqual([
        "name",
        "phone",
        "email",
        "lead_source",
        "created_at",
        "qualification",
      ]);
    }
  });

  it("nombre en mayúsculas → normalizado (c-002)", () => {
    expect(row("c-002", "name")).toMatchObject({
      raw: "JOSÉ LUIS MARTÍN CABRERA",
      normalized: "José Luis Martín Cabrera",
      status: "normalized",
      rules: ["TODO MAYÚSCULAS → nombre propio"],
    });
  });

  it("sin nombre → inferido desde el teléfono (c-004)", () => {
    expect(row("c-004", "name")).toMatchObject({ raw: null, rawKind: "null", normalized: "+34 688 45 67 89", status: "inferred" });
  });

  it("teléfono con 00 → normalizado (c-002)", () => {
    expect(row("c-002", "phone")).toMatchObject({
      raw: "0034612889034",
      normalized: "+34 612 88 90 34",
      detail: "E.164: +34612889034",
      status: "normalized",
    });
  });

  it("teléfono nacional sin prefijo → inferido (c-003)", () => {
    expect(row("c-003", "phone").status).toBe("inferred");
  });

  it("teléfono ya canónico → limpio (c-001)", () => {
    expect(row("c-001", "phone")).toMatchObject({ status: "clean", rules: ["Ya venía en formato canónico"] });
  });

  it("email con doble @ → inválido (c-015)", () => {
    expect(row("c-015", "email")).toMatchObject({ raw: "mdolores@@gmail.com", normalized: null, status: "invalid" });
  });

  it("origen con alias en minúsculas → normalizado (c-002, c-009)", () => {
    expect(row("c-002", "lead_source")).toMatchObject({ raw: "llamada", normalized: "Llamada", status: "normalized" });
    expect(row("c-009", "lead_source")).toMatchObject({ raw: "whatsapp", normalized: "WhatsApp", status: "normalized" });
  });

  it("origen nulo → faltante (c-012)", () => {
    expect(row("c-012", "lead_source").status).toBe("missing");
  });

  it("fechas: ISO limpio, dd/mm/aaaa y epoch normalizados", () => {
    expect(row("c-001", "created_at")).toMatchObject({ status: "clean", normalized: "08 jul 2026, 12:28" });
    expect(row("c-005", "created_at")).toMatchObject({ raw: "11/07/2026", status: "normalized", normalized: "11 jul 2026" });
    expect(row("c-012", "created_at")).toMatchObject({ raw: "1782259200", rawKind: "number", normalized: "24 jun 2026" });
  });

  it("cualificación como string JSON (c-003)", () => {
    const r = row("c-003", "qualification");
    expect(r.rawKind).toBe("text");
    expect(r.rules[0]).toMatch(/string JSON/);
    expect(r.normalized).toBe("3 datos en Alquiler");
  });

  it("cualificación con ingresos fuera del bloque (c-008)", () => {
    expect(row("c-008", "qualification").rules).toContain("Ingresos fuera del bloque → grupo Situación financiera");
  });

  it("cualificación con _meta (c-001)", () => {
    expect(row("c-001", "qualification").rules).toContain("Se descartan metadatos internos (_meta)");
  });

  it("cuenta campos corregidos e incidencias", () => {
    const report = buildNormalizationReport(contactById("c-015"));
    expect(report.issueCount).toBe(1);
    expect(report.fixedCount).toBeGreaterThanOrEqual(4);
  });
});
