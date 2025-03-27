import { defineConfig } from "tsup";

export default defineConfig({
	dts: true, // Generate .d.ts files
	minify: false, // Minify output
	sourcemap: true, // Generate sourcemaps
	treeshake: true, // Remove unused code
	splitting: false, // Split output into chunks
	clean: true, // Clean output directory before building
	outDir: "dist", // Output directory
	entry: ["src/**/*.ts", "!src/**/__internal__/**"], // Entry point(s)
	// entry: ["src/**/*.ts"], // Entry point(s)
	format: ["esm", "cjs"], // Output format(s)
});
