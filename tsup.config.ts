import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/data.ts", "src/fields.tsx", "src/studio.tsx", "src/diagnostics.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	splitting: false,
	external: ["react", "react-dom"],
	treeshake: true,
	sourcemap: true,
});
