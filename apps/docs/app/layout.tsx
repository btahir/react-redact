import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
	title: "react-redact",
	description:
		"One keyboard shortcut to make your entire app demo-safe. Visually redact PII with blur, mask, or replace.",
	openGraph: {
		title: "react-redact",
		description: "One keyboard shortcut to make your entire app demo-safe.",
		images: ["/og-image.png"],
	},
};

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
