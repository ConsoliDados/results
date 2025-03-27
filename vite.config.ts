/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [],
	test: {
		globals: true,
		setupFiles: "./test/setup-tests.ts",
	},
});
