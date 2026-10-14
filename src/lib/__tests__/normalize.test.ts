import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  normalizeChannel,
  normalizePhone,
  parseFlexibleDate,
  resolveDisplayName,
  toTitleCase,
} from "@/lib/normalize";
import { contactById, makeContact } from "./fixtures";

describe("normalizePhone", () => {
  it.each([
    ["+34 655 12 34 56", "con espacios agrupados de a dos (c-001)"],
    ["0034655123456", "con prefijo internacional 00"],
    ["655123456", "nacional de 9 dígitos sin prefijo (c-009)"],
    ["+34655123456", "E.164 compacto"],
    ["+34 655 123 456", "agrupado de a tres"],
    ["+34-655-123-456", "con guiones"],
  ])("normaliza %s (%s) al mismo número", (raw) => {
    expect(normalizePhone(raw)).toEqual({ e164Digits: "34655123456", display: "+34 655 12 34 56" });
  });

  it("cubre los seis formatos presentes en el dataset", () => {
    const expected: Record<string, string> = {
      "c-001": "+34 655 12 34 56",
      "c-002": "+34 612 88 90 34",
      "c-003": "+34 699 11 22 33",
      "c-004": "+34 688 45 67 89",
      "c-008": "+34 633 44 55 66",
      "c-015": "+34 644 55 66 77",
    };
    for (const [id, display] of Object.entries(expected)) {
      expect(normalizePhone(contactById(id).phone)?.display, id).toBe(display);
    }
  });

  it("devuelve null cuando no hay teléfono", () => {
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(contactById("c-005").phone)).toBeNull();
  });

  it("descarta números demasiado cortos para ser válidos", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("sin teléfono")).toBeNull();
  });
});

describe("parseFlexibleDate", () => {
  it("interpreta ISO 8601 con zona", () => {
    expect(parseFlexibleDate("2026-07-08T10:28:00Z")?.toISOString()).toBe("2026-07-08T10:28:00.000Z");
  });

  it("interpreta dd/mm/yyyy como día/mes, no mes/día (c-005)", () => {
    const d = parseFlexibleDate("11/07/2026");
    expect([d?.getFullYear(), d?.getMonth(), d?.getDate()]).toEqual([2026, 6, 11]);
  });

  it("interpreta dd/mm/yyyy HH:mm con hora (c-015)", () => {
    const d = parseFlexibleDate("10/07/2026 18:42");
    expect([d?.getDate(), d?.getMonth(), d?.getHours(), d?.getMinutes()]).toEqual([10, 6, 18, 42]);
  });

  it("interpreta epoch en segundos (c-012) y en milisegundos", () => {
    expect(parseFlexibleDate(1782259200)?.toISOString()).toBe("2026-06-24T00:00:00.000Z");
    expect(parseFlexibleDate(1782259200000)?.toISOString()).toBe("2026-06-24T00:00:00.000Z");
  });

  it("devuelve null ante valores vacíos o ilegibles", () => {
    expect(parseFlexibleDate(null)).toBeNull();
    expect(parseFlexibleDate(undefined)).toBeNull();
    expect(parseFlexibleDate("")).toBeNull();
    expect(parseFlexibleDate("ayer por la tarde")).toBeNull();
  });
});

describe("formatDate / formatDateTime", () => {
  it("formatean los distintos formatos crudos en es-ES", () => {
    expect(formatDate("2026-07-08T10:28:00Z")).toBe("08 jul 2026");
    expect(formatDate("11/07/2026")).toBe("11 jul 2026");
    expect(formatDate(1782259200)).toBe("24 jun 2026");
    expect(formatDateTime("10/07/2026 18:42")).toBe("10 jul 2026, 18:42");
  });

  it("muestran un texto explícito si la fecha no se puede leer", () => {
    expect(formatDate(null)).toBe("Fecha desconocida");
    expect(formatDateTime("no es una fecha")).toBe("Fecha desconocida");
  });
});

describe("toTitleCase", () => {
  it("corrige nombres en mayúsculas conservando tildes (c-002, c-015)", () => {
    expect(toTitleCase("JOSÉ LUIS MARTÍN CABRERA")).toBe("José Luis Martín Cabrera");
    expect(toTitleCase("MARÍA DOLORES GUTIÉRREZ SANTOS")).toBe("María Dolores Gutiérrez Santos");
  });

  it("corrige nombres en minúsculas (c-009)", () => {
    expect(toTitleCase("carmen ruiz")).toBe("Carmen Ruiz");
  });

  it("respeta nombres que ya vienen con mayúsculas mixtas", () => {
    expect(toTitleCase("David P.")).toBe("David P.");
    expect(toTitleCase("  Álvaro Quintana Ros ")).toBe("Álvaro Quintana Ros");
  });
});

describe("resolveDisplayName", () => {
  it("usa el nombre normalizado y sus iniciales", () => {
    expect(resolveDisplayName(contactById("c-002"))).toEqual({
      name: "José Luis Martín Cabrera",
      isFallback: false,
      initials: "JL",
    });
    expect(resolveDisplayName(makeContact({ full_name: "Cher" })).initials).toBe("CH");
  });

  it("cae al teléfono normalizado cuando no hay nombre (c-004, c-012)", () => {
    expect(resolveDisplayName(contactById("c-004"))).toEqual({ name: "+34 688 45 67 89", isFallback: true, initials: "#" });
    expect(resolveDisplayName(contactById("c-012")).isFallback).toBe(true);
  });

  it("cae al email y luego al id", () => {
    expect(resolveDisplayName(makeContact({ full_name: "  ", phone: null, email: "x@y.com" }))).toEqual({
      name: "x@y.com",
      isFallback: true,
      initials: "X",
    });
    expect(resolveDisplayName(makeContact({ full_name: null, phone: null, email: null })).name).toBe("Contacto c-test");
  });
});

describe("normalizeChannel", () => {
  it.each([
    ["VOICE_CALL", "Llamada"],
    ["llamada", "Llamada"],
    ["VOZ", "Llamada"],
    ["VOICE", "Llamada"],
    ["WHATSAPP", "WhatsApp"],
    ["whatsapp", "WhatsApp"],
    ["WEBSITE", "Web"],
    ["WEB_FORM", "Formulario web"],
    ["META_LEAD_ADS", "Meta Ads"],
    ["EMAIL", "Email"],
    ["WITEI", "Importado (Witei)"],
    ["CRM", "Importado (CRM)"],
  ])("unifica %s → %s", (raw, label) => {
    expect(normalizeChannel(raw).label).toBe(label);
  });

  it("marca como desconocido un origen nulo o no mapeado (c-012)", () => {
    expect(normalizeChannel(null).label).toBe("Origen desconocido");
    expect(normalizeChannel("FAX").label).toBe("Origen desconocido");
  });
});
