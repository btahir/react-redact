import type { ReactNode } from "react";
import Link from "next/link";

const nav = [
	{ label: "Getting Started", href: "/docs" },
	{ section: "Components" },
	{ label: "Redact", href: "/docs/components/redact" },
	{ label: "RedactAuto", href: "/docs/components/redact-auto" },
	{ label: "RedactProvider", href: "/docs/components/provider" },
	{ section: "Hooks" },
	{ label: "useRedactMode", href: "/docs/hooks/use-redact-mode" },
	{ label: "useRedactPatterns", href: "/docs/hooks/use-redact-patterns" },
	{ section: "Guides" },
	{ label: "Modes", href: "/docs/modes" },
	{ label: "Patterns", href: "/docs/patterns" },
	{ label: "Recipes", href: "/docs/recipes" },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="docs-layout">
			<aside className="docs-sidebar">
				<Link href="/" style={{ fontWeight: 600, marginBottom: "1rem", display: "block" }}>
					react-redact
				</Link>
				<nav>
					{nav.map((item, i) =>
						"section" in item ? (
							<div key={i} className="section">
								{item.section}
							</div>
						) : (
							<Link key={i} href={item.href}>
								{item.label}
							</Link>
						),
					)}
				</nav>
			</aside>
			<main className="docs-main">{children}</main>
		</div>
	);
}
