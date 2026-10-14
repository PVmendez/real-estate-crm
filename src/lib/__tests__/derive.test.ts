import { describe, expect, it } from "vitest";
import { computeConsent, computeHealth, findDuplicates, lastInteractionAt, needsHumanHandoff } from "@/lib/derive";
import { allContacts, contactById, makeContact } from "./fixtures";

describe("lastInteractionAt", () => {
  it("devuelve la interacción más reciente", () => {
    expect(lastInteractionAt(contactById("c-016"))?.toISOString()).toBe("2026-07-13T19:22:00.000Z");
  });

  it("compara fechas en formatos distintos (c-015: dd/mm/yyyy HH:mm, hora de Madrid)", () => {
    expect(lastInteractionAt(contactById("c-015"))?.toISOString()).toBe("2026-07-10T16:42:00.000Z");
  });

  it("devuelve null sin interacciones o con fechas ilegibles", () => {
    expect(lastInteractionAt(contactById("c-012"))).toBeNull();
    const broken = makeContact({
      interactions: [{ id: "i", channel: "EMAIL", direction: "inbound", created_at: "???", content: "", metadata: null }],
    });
    expect(lastInteractionAt(broken)).toBeNull();
  });
});

describe("computeHealth", () => {
  it("suma solo los checks que se cumplen", () => {
    const health = computeHealth(contactById("c-001"));
    expect(health.score).toBe(80);
    expect(health.items.filter((i) => !i.ok).map((i) => i.label)).toEqual(["Email válido", "Agente asignado"]);
  });

  it("no puntúa un email con formato inválido (c-015)", () => {
    expect(computeHealth(contactById("c-015")).items.find((i) => i.label === "Email válido")?.ok).toBe(false);
  });

  it("no da por bueno un nombre derivado del teléfono (c-012)", () => {
    const health = computeHealth(contactById("c-012"));
    expect(health.score).toBe(15);
    expect(health.items[0].ok).toBe(false);
  });

  it("cuenta la cualificación que llega como string JSON (c-003)", () => {
    const item = computeHealth(contactById("c-003")).items.find((i) => i.label.includes("cualificación"));
    expect(item?.ok).toBe(true);
  });

  it("los puntos posibles suman 100", () => {
    expect(computeHealth(makeContact()).items.reduce((s, i) => s + i.points, 0)).toBe(100);
  });
});

describe("findDuplicates", () => {
  it("detecta el mismo teléfono escrito distinto (c-001 ↔ c-009)", () => {
    const matches = findDuplicates(allContacts, contactById("c-001"));
    expect(matches.map((m) => [m.contact.id, m.reason])).toEqual([["c-009", "telefono"]]);
  });

  it("detecta nombres iguales ignorando tildes, mayúsculas y espacios", () => {
    const a = makeContact({ id: "a", phone: null, full_name: "José  Martín" });
    const b = makeContact({ id: "b", phone: null, full_name: "JOSE MARTIN" });
    expect(findDuplicates([a, b], a).map((m) => m.reason)).toEqual(["nombre"]);
  });

  it("no cruza organizaciones ni se detecta a sí mismo", () => {
    const a = makeContact({ id: "a" });
    const b = makeContact({ id: "b", organization_id: "OTRA" });
    expect(findDuplicates([a, b], a)).toEqual([]);
  });

  it("no marca falsos positivos en contactos sin teléfono ni nombre", () => {
    const a = makeContact({ id: "a", phone: null, full_name: null });
    const b = makeContact({ id: "b", phone: null, full_name: null });
    expect(findDuplicates([a, b], a)).toEqual([]);
  });
});

describe("computeConsent", () => {
  it("permite los canales para los que hay dato (c-001: solo teléfono)", () => {
    expect(computeConsent(contactById("c-001"))).toEqual({ blocked: false, allowedChannels: ["call", "whatsapp"], reason: null });
  });

  it("bloquea por tag no-llamar pero respeta 'solo por email' en las notas (c-013)", () => {
    const consent = computeConsent(contactById("c-013"));
    expect(consent.blocked).toBe(true);
    expect(consent.allowedChannels).toEqual(["email"]);
    expect(consent.reason).toMatch(/SOLO por email/);
  });

  it("bloquea todo si matching_enabled es false y no hay excepción", () => {
    expect(computeConsent(makeContact({ matching_enabled: false }))).toEqual({
      blocked: true,
      allowedChannels: [],
      reason: "Este contacto ha pedido no ser contactado.",
    });
  });

  it("no ofrece email si el email es inválido (c-015)", () => {
    expect(computeConsent(contactById("c-015")).allowedChannels).toEqual(["call", "whatsapp"]);
  });

  it("no habilita 'solo email' si el email no es válido", () => {
    const consent = computeConsent(makeContact({ tags: ["no-llamar"], notes: "solo por email", email: "x@@y.com" }));
    expect(consent.allowedChannels).toEqual([]);
  });

  it("el tag es insensible a mayúsculas", () => {
    expect(computeConsent(makeContact({ tags: ["NO-LLAMAR"] })).blocked).toBe(true);
  });
});

describe("needsHumanHandoff", () => {
  it("refleja ai_handoff (c-016)", () => {
    expect(needsHumanHandoff(contactById("c-016"))).toBe(true);
    expect(needsHumanHandoff(contactById("c-001"))).toBe(false);
  });
});
