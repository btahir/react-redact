import { source } from "@/lib/source";

function getBaseUrl(): string {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.VERCEL_PROJECT_PRODUCTION_URL ??
		"https://react-redact.vercel.app";
	return raw.startsWith("http://") || raw.startsWith("https://")
		? raw
		: `https://${raw}`;
}

export const revalidate = false;

export function GET() {
	const pages = source.getPages();
	const BASE_URL = getBaseUrl();

	const lines = [
		"# react-redact",
		"",
		"> Local React demo data, visual policy authoring, and bounded preflight checks.",
		"",
		"Use explicit synthetic scenarios and render-time fields for public demos. Automatic DOM scanning is best-effort post-render concealment, never a security boundary. Optional Studio and CLI share a versioned policy.",
		"",
		"## Docs",
		"",
	];

	for (const page of pages) {
		const url = `${BASE_URL}${page.url}`;
		const title = page.data.title;
		const desc = page.data.description || "";
		lines.push(`- [${title}](${url}): ${desc}`);
	}

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400, s-maxage=86400",
		},
	});
}
