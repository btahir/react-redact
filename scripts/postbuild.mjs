import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";

const USE_CLIENT = '"use client";\n';

// Prepend "use client" to JS output files
for (const file of ["dist/index.js", "dist/index.cjs"]) {
	const content = readFileSync(file, "utf8");
	if (!content.startsWith('"use client"')) {
		writeFileSync(file, USE_CLIENT + content);
	}
}

// Copy CSS
mkdirSync("dist/styles", { recursive: true });
copyFileSync("src/styles/redact.css", "dist/styles/redact.css");

console.log('✓ Prepended "use client" + copied CSS');
