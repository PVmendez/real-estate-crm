// Directorio de usuarios de la agencia. Los contactos guardan solo el id; la UI muestra el nombre.
const AGENTS: Record<string, string> = {
  "usr-mario-ortega": "Mario Ortega",
};

export function agentName(id: string | null): string | null {
  if (!id) return null;
  return AGENTS[id] ?? id;
}
