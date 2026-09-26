import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		links: [{ text: "Studio", url: "/studio" }, { text: "Support this project", url: "https://react-tourlight.vercel.app/support", external: true }],
		nav: {
			title: "react-redact",
		},
	};
}
