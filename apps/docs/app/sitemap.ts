import { source } from "@/lib/source";
import type { MetadataRoute } from "next";

function getBaseUrl(): string {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.VERCEL_PROJECT_PRODUCTION_URL ??
		"https://react-redact.vercel.app";
	return raw.startsWith("http://") || raw.startsWith("https://")
		? raw
		: `https://${raw}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
	const pages = source.getPages();
	const BASE_URL = getBaseUrl();

	const docEntries: MetadataRoute.Sitemap = pages.map((page) => ({
		url: `${BASE_URL}${page.url}`,
		lastModified: new Date("2026-09-25"),
		changeFrequency: "weekly",
		priority: page.url === "/docs" ? 0.9 : 0.7,
	}));

	return [
		{
			url: BASE_URL,
			lastModified: new Date("2026-09-25"),
			changeFrequency: "weekly",
			priority: 1.0,
		},
		...docEntries,
		...["overview", "customers", "invoices"].map(view => ({ url: `${BASE_URL}/studio/${view}`, lastModified: new Date("2026-09-25") })),
	];
}
