import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin caché incremental: los datos salen de un JSON empaquetado en el Worker y las páginas son dinámicas.
export default defineCloudflareConfig();
