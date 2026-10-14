import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Las fechas "dd/mm/yyyy" se interpretan en hora local: fijamos UTC (la zona de Cloudflare Workers)
// para que los tests den lo mismo en cualquier máquina.
process.env.TZ = "UTC";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
