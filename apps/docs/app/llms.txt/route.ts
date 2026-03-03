import { source } from "@/lib/source";

function getBaseUrl(): string {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.VERCEL_PROJECT_PRODUCTION_URL ??
		"http://localhost:3001";
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
		"> One keyboard shortcut to make your entire app demo-safe.",
		"",
		"Visually redact PII with blur, mask, or replace. Drop in a provider, hit a shortcut, and every sensitive field in your React app is hidden — perfect for demos, screenshots, and screen shares.",
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
