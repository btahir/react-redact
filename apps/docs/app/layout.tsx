import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider";
import { Sora, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const sora = Sora({
	subsets: ["latin"],
	variable: "--font-sora",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

function getMetadataBase(): URL {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.VERCEL_PROJECT_PRODUCTION_URL ??
		"http://localhost:3001";
	const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
	return new URL(normalized);
}

export const metadata: Metadata = {
	title: "react-redact",
	description:
		"One keyboard shortcut to make your entire app demo-safe. Visually redact PII with blur, mask, or replace.",
	metadataBase: getMetadataBase(),
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-icon.png",
	},
	openGraph: {
		title: "react-redact",
		description: "One keyboard shortcut to make your entire app demo-safe.",
		images: ["/og-image.png"],
	},
};

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${sora.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
