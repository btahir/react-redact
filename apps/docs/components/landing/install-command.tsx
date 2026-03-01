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
		<section className="px-6 py-12">
			<div className="mx-auto max-w-lg">
				<div className="rounded-xl border border-fd-border bg-fd-card/60 backdrop-blur-sm overflow-hidden">
					<div className="flex">
						{managers.map((m, i) => (
							<button
								key={m.name}
								type="button"
								onClick={() => setActive(i)}
								className={`flex-1 py-2.5 text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.15em] font-medium transition-all duration-200 ${
									active === i
										? "bg-fd-foreground text-fd-background"
										: "text-fd-muted-foreground hover:text-fd-foreground bg-fd-muted/30"
								}`}
							>
								{m.name}
							</button>
						))}
					</div>
					<div className="flex items-center justify-between px-5 py-4">
						<code className="font-[family-name:var(--font-mono)] text-[14px] text-fd-foreground">
							<span className="text-red-500">$</span>{" "}
							{managers[active].command}
						</code>
						<button
							type="button"
							onClick={copy}
							className={`ml-4 rounded-md p-2 transition-all duration-200 ${
								copied
									? "bg-emerald-500/10 text-emerald-500"
									: "text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground"
							}`}
							aria-label="Copy to clipboard"
						>
							{copied ? (
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
