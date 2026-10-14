import { describe, expect, it } from "vitest";
import {
  detectDateFormat,
  formatDate,
  formatDateTime,
  normalizeChannel,
  normalizeEmail,
  normalizePhone,
  parseFlexibleDate,
  phoneRulesApplied,
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

  it("interpreta dd/mm/yyyy como día/mes en hora de Madrid (c-005)", () => {
    // Medianoche del 11 de julio en Madrid (CEST, UTC+2) = 22:00 UTC del día anterior.
    expect(parseFlexibleDate("11/07/2026")?.toISOString()).toBe("2026-07-10T22:00:00.000Z");
  });

  it("interpreta dd/mm/yyyy HH:mm como hora de pared de Madrid (c-015)", () => {
    expect(parseFlexibleDate("10/07/2026 18:42")?.toISOString()).toBe("2026-07-10T16:42:00.000Z");
  });

  it("aplica el horario de invierno (CET, UTC+1)", () => {
    expect(parseFlexibleDate("15/01/2026 09:00")?.toISOString()).toBe("2026-01-15T08:00:00.000Z");
  });

  it("no depende de la zona horaria del proceso", () => {
    const original = process.env.TZ;
    process.env.TZ = "America/Montevideo";
    try {
      expect(parseFlexibleDate("10/07/2026 18:42")?.toISOString()).toBe("2026-07-10T16:42:00.000Z");
    } finally {
      process.env.TZ = original;
    }
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
  it("formatean los distintos formatos crudos en es-ES y hora de Madrid", () => {
    expect(formatDate("2026-07-08T10:28:00Z")).toBe("08 jul 2026");
    expect(formatDateTime("2026-07-08T10:28:00Z")).toBe("08 jul 2026, 12:28");
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

describe("phoneRulesApplied", () => {
  it.each([
    ["+34 655 12 34 56", ["strip-separators"]],
    ["0034612889034", ["intl-00-prefix"]],
    ["699112233", ["assume-spain"]],
    ["+34688456789", []],
    ["+34-644-556-677", ["strip-separators"]],
  ] as const)("%s → %j", (raw, rules) => {
    expect(phoneRulesApplied(raw)).toEqual(rules);
  });

  it("no aplica reglas sin teléfono", () => {
    expect(phoneRulesApplied(null)).toEqual([]);
  });
});

describe("normalizeEmail", () => {
  it("acepta emails válidos y los pasa a minúsculas", () => {
    expect(normalizeEmail("lucia.fdz@gmail.com")).toEqual({ value: "lucia.fdz@gmail.com", valid: true });
    expect(normalizeEmail("  Ana@Example.COM ")).toEqual({ value: "ana@example.com", valid: true });
  });

  it("detecta el doble @ del dataset (c-015)", () => {
    expect(normalizeEmail(contactById("c-015").email)).toEqual({ value: "mdolores@@gmail.com", valid: false });
  });

  it("rechaza emails sin dominio y devuelve null si no hay", () => {
    expect(normalizeEmail("ana@localhost")?.valid).toBe(false);
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail("   ")).toBeNull();
  });
});

describe("detectDateFormat", () => {
  it.each([
    ["2026-07-08T10:28:00Z", "iso"],
    ["11/07/2026", "dmy"],
    ["11/07/2026 18:42", "dmy-time"],
    [1782259200, "epoch-s"],
    [1782259200000, "epoch-ms"],
    ["ayer", "unknown"],
    [null, "unknown"],
  ] as const)("%s → %s", (raw, format) => {
    expect(detectDateFormat(raw)).toBe(format);
  });
});
