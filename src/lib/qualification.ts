import type { Contact, QualificationBlock, QualificationFact, QualificationGroup } from "./types";

export interface QualificationFactView {
  key: string;
  label: string;
  fact: QualificationFact;
}

export interface QualificationGroupView {
  operation: string;
  label: string;
  facts: QualificationFactView[];
}

export interface ParsedQualification {
  groups: QualificationGroupView[];
  parseError: boolean;
}

const OPERATION_LABELS: Record<string, string> = {
  sale: "Compra",
  rental: "Alquiler",
  shared: "Datos compartidos",
  financiero: "Situación financiera",
};

const KEY_LABELS: Record<string, string> = {
  zones: "Zona",
  budget: "Presupuesto",
  bedrooms: "Habitaciones (mín.)",
  financing: "Financiación",
  terrace: "Terraza",
  has_pets: "Mascotas",
  urgency: "Urgencia",
  floor_pref: "Planta preferida",
  elevator: "Ascensor",
  orientation: "Orientación",
  garage: "Garaje",
  accesibilidad_movilidad_reducida: "Accesibilidad / movilidad reducida",
  net_income: "Ingresos netos declarados",
};

function humanizeKey(key: string): string {
  return KEY_LABELS[key] ?? key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function parseQualificationData(raw: Contact["qualification_data"]): ParsedQualification {
  if (!raw) return { groups: [], parseError: false };

  let data: QualificationBlock;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw) as QualificationBlock;
    } catch {
      return { groups: [], parseError: true };
    }
  } else {
    data = raw;
  }

  const groups: QualificationGroupView[] = [];

  if (data.qualification && typeof data.qualification === "object") {
    for (const [operation, group] of Object.entries(data.qualification)) {
      if (operation === "_meta" || !group || typeof group !== "object") continue;
      const facts = Object.entries(group as QualificationGroup)
        .filter(([k]) => k !== "_meta")
        .map(([key, fact]) => ({ key, label: humanizeKey(key), fact }));
      if (facts.length > 0) {
        groups.push({ operation, label: OPERATION_LABELS[operation] ?? humanizeKey(operation), facts });
      }
    }
  }

  if (typeof data.net_income === "number") {
    groups.push({
      operation: "financiero",
      label: OPERATION_LABELS.financiero,
      facts: [
        {
          key: "net_income",
          label: humanizeKey("net_income"),
          fact: {
            value: data.net_income,
            source: data.income_verified ? "verificado" : ((data.income_source as string) ?? "declarado"),
            updatedAt: data.income_updated_at as string | undefined,
          },
        },
      ],
    });
  }

  return { groups, parseError: false };
}

export function formatFactValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.map(String).join(", ");

  const isMoney = /budget|precio|income/i.test(key);

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("min" in obj || "max" in obj) {
      const min = typeof obj.min === "number" ? obj.min : undefined;
      const max = typeof obj.max === "number" ? obj.max : undefined;
      const fmt = (n: number) => (isMoney ? formatCurrency(n) : String(n));
      if (min != null && max != null) return `entre ${fmt(min)} y ${fmt(max)}`;
      if (max != null) return `hasta ${fmt(max)}`;
      if (min != null) return `desde ${fmt(min)}`;
    }
    return JSON.stringify(obj);
  }

  if (typeof value === "number") return isMoney ? formatCurrency(value) : String(value);
  return String(value);
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export type ProvenanceKind = "ai" | "human" | "import" | "unknown";

export function provenanceInfo(source?: string): { label: string; kind: ProvenanceKind } {
  if (!source) return { label: "Origen sin especificar", kind: "unknown" };
  const s = source.toLowerCase();
  if (s === "manual") return { label: "Editado por un humano", kind: "human" };
  if (s === "verificado") return { label: "Verificado por un humano", kind: "human" };
  if (s.startsWith("import")) return { label: "Importado del CRM anterior", kind: "import" };
  if (s === "explicit") return { label: "Dicho por el cliente", kind: "ai" };
  return { label: source, kind: "unknown" };
}
