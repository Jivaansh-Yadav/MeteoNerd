import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: {},
  },
  plugins: [
    {
      name: "lovable-server-entry-shim",
      apply: "build",
      writeBundle(options) {
        const dir = options.dir;
        if (!dir || !dir.includes("dist/server")) return;
        // The preview-server plugin imports dist/server/server.js during prerender,
        // but nitro emits the cloudflare-module worker as index.mjs (which needs a
        // real CF execution context). Our SSR wrapper lives in _ssr/ssr.mjs and
        // supplies a Node-safe shim, so route the preview import there instead.
        const wrapper = join(dir, "_ssr/ssr.mjs");
        const dest = join(dir, "server.js");
        if (!existsSync(wrapper) || existsSync(dest)) return;
        writeFileSync(dest, `export { default } from "./_ssr/ssr.mjs";\n`);
      },
    },
  ],
});
