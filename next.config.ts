import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// En `next dev`, expone los bindings de Cloudflare (wrangler.jsonc) igual que en producción.
initOpenNextCloudflareForDev();
