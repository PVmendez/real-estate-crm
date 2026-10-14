import { describe, expect, it } from "vitest";
import { filterAndSort, matchesQuery, toListItem } from "@/lib/contact-list";
import { allContacts, contactById } from "./fixtures";

const items = allContacts.map(toListItem);
const ids = (list: { id: string }[]) => list.map((i) => i.id);

describe("toListItem", () => {
  it("expone el email solo si es válido (c-015)", () => {
    expect(toListItem(contactById("c-015")).email).toBeNull();
    expect(toListItem(contactById("c-005")).email).toBe("lucia.fdz@gmail.com");
  });

  it("marca contactos bloqueados, de prueba y que necesitan humano", () => {
    expect(toListItem(contactById("c-013")).doNotContact).toBe(true);
    expect(toListItem(contactById("c-014")).isTest).toBe(true);
    expect(toListItem(contactById("c-016")).needsHuman).toBe(true);
  });
});

describe("matchesQuery", () => {
  const carmen = toListItem(contactById("c-001"));

  it("busca por nombre ignorando tildes y mayúsculas", () => {
    expect(matchesQuery(toListItem(contactById("c-002")), "jose luis")).toBe(true);
    expect(matchesQuery(toListItem(contactById("c-016")), "ALVARO")).toBe(true);
  });

  it("busca por teléfono en cualquier formato", () => {
    for (const q of ["655 12 34", "655-123", "+34655", "0034 655", "655123456"]) {
      expect(matchesQuery(carmen, q), q).toBe(true);
    }
    expect(matchesQuery(carmen, "699")).toBe(false);
  });

  it("busca por email", () => {
    expect(matchesQuery(toListItem(contactById("c-006")), "hotmail")).toBe(true);
  });

  it("una consulta vacía coincide con todo", () => {
    expect(matchesQuery(carmen, "   ")).toBe(true);
  });
});

describe("filterAndSort", () => {
  it("la búsqueda por teléfono encuentra el duplicado escrito distinto", () => {
    expect(ids(filterAndSort(items, { query: "655 123 456", status: "todos", sort: "nombre" }))).toEqual(["c-009", "c-001"]);
  });

  it("filtra por estado de cualificación", () => {
    expect(ids(filterAndSort(items, { query: "", status: "parcial", sort: "nombre" }))).toEqual(["c-013"]);
    expect(filterAndSort(items, { query: "", status: "invalido", sort: "nombre" })).toEqual([]);
  });

  it("ordena por nombre con los contactos sin nombre al final", () => {
    const sorted = ids(filterAndSort(items, { query: "", status: "todos", sort: "nombre" }));
    expect(sorted[0]).toBe("c-016"); // Álvaro
    expect(sorted.slice(-2).sort()).toEqual(["c-004", "c-012"]);
  });

  it("ordena por última interacción, y los que no tienen van al final por fecha de alta", () => {
    const sorted = ids(filterAndSort(items, { query: "", status: "todos", sort: "reciente" }));
    expect(sorted[0]).toBe("c-016");
    expect(sorted.slice(-2)).toEqual(["c-012", "c-014"]);
  });

  it("ordena por calidad del dato de mayor a menor", () => {
    const sorted = filterAndSort(items, { query: "", status: "todos", sort: "calidad" });
    expect(sorted.map((i) => i.health)).toEqual([...sorted.map((i) => i.health)].sort((a, b) => b - a));
  });
});
