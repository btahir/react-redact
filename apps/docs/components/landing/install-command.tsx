"use client";

import { useState } from "react";

const managers = [
	{ name: "pnpm", command: "pnpm add react-redact" },
	{ name: "npm", command: "npm install react-redact" },
	{ name: "yarn", command: "yarn add react-redact" },
] as const;

export function InstallCommand() {
	const [active, setActive] = useState(0);
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(managers[active].command);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section className="px-6 py-10">
			<div className="mx-auto max-w-md">
				<div className="rounded-lg border border-fd-border bg-fd-card overflow-hidden">
					{/* Tabs */}
					<div className="flex border-b border-fd-border">
						{managers.map((m, i) => (
							<button
								key={m.name}
								type="button"
								onClick={() => setActive(i)}
								className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
									active === i
										? "bg-fd-background text-fd-foreground"
										: "text-fd-muted-foreground hover:text-fd-foreground"
								}`}
							>
								{m.name}
							</button>
						))}
					</div>
					{/* Command */}
					<div className="flex items-center justify-between px-4 py-3">
						<code className="font-mono text-sm text-fd-foreground">
							<span className="text-fd-muted-foreground">$ </span>
							{managers[active].command}
						</code>
						<button
							type="button"
							onClick={copy}
							className="ml-3 rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
							aria-label="Copy to clipboard"
						>
							{copied ? (
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<title>Copied</title>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							) : (
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<title>Copy</title>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
