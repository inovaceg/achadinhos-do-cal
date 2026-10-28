import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [dyadComponentTagger()],
  },
});