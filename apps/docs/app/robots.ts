import type { MetadataRoute } from "next";

function getBaseUrl(): string {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.VERCEL_PROJECT_PRODUCTION_URL ??
		"http://localhost:3001";
	return raw.startsWith("http://") || raw.startsWith("https://")
		? raw
		: `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${getBaseUrl()}/sitemap.xml`,
	};
}
