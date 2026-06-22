import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: {},
  },
  plugins: [
    {
      name: "lovable-server-entry-alias",
      apply: "build",
      writeBundle(options) {
        const dir = options.dir;
        if (!dir || !dir.includes("dist/server")) return;
        // Some pipelines emit index.mjs; the preview-server plugin imports server.js.
        const candidates = ["_ssr/ssr.mjs", "index.mjs", "server.mjs"];
        const dest = join(dir, "server.js");
        if (existsSync(dest)) return;
        for (const name of candidates) {
          const src = join(dir, name);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            return;
          }
        }
      },
    },
  ],
});
