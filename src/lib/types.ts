export interface Interaction {
  id: string;
  channel: string;
  direction: "inbound" | "outbound";
  created_at: string | number;
  content: string;
  metadata: Record<string, unknown> | null;
}

export interface QualificationFact {
  value: unknown;
  source?: string;
  confidence?: string;
  updatedAt?: string;
  sourceRef?: string;
}

export type QualificationGroup = Record<string, QualificationFact>;

export interface QualificationBlock {
  qualification?: Record<string, QualificationGroup>;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Contact {
  id: string;
  organization_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  lead_source: string | null;
  contact_type: string | null;
  created_at: string | number;
  ai_handoff: boolean;
  handoff_reason?: string;
  handoff_requested_at?: string;
  is_test: boolean;
  assigned_agent_id: string | null;
  matching_enabled: boolean;
  tags: string[] | null;
  notes: string | null;
  qualification_data: QualificationBlock | string | null;
  interest_preferences: Record<string, unknown> | null;
  interactions: Interaction[];
}

export interface Property {
  ref: string;
  titulo: string;
  operacion: "venta" | "alquiler";
  zona: string;
  precio: number;
  habitaciones: number;
  banos: number;
  m2: number;
  planta: number | null;
  ascensor: boolean | null;
  plaza_garaje: boolean;
  admite_mascotas: boolean;
  descripcion_corta: string;
  horario_visitas: string;
}
