"use client";

import { useState } from "react";

const rows = [
	{ label: "name", real: "Sarah Johnson", fake: "Jane Demo" },
	{ label: "email", real: "sarah.j@acme.corp", fake: "jane.demo@example.com" },
	{ label: "phone", real: "(415) 555-0198", fake: "(555) 200-4321" },
	{ label: "card", real: "4532 8901 2345 6789", fake: "•••• •••• •••• ••••" },
	{ label: "ip", real: "192.168.1.42", fake: "10.0.0.1" },
];

export function BeforeAfter() {
	const [showRedacted, setShowRedacted] = useState(false);

	return (
		<section className="relative px-6 py-24 overflow-hidden">
			{/* Subtle background shift */}
			<div className="pointer-events-none absolute inset-0 -z-10 bg-fd-muted/20" />

			<div className="mx-auto max-w-3xl">
				<p className="text-center text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-red-500 font-semibold">
					Comparison
				</p>
				<h2 className="mt-4 text-center font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight text-fd-foreground md:text-4xl">
					Before & after
				</h2>
				<p className="mx-auto mt-4 max-w-md text-center text-[15px] text-fd-muted-foreground">
					See what your audience sees when redaction is on.
				</p>

				{/* Toggle */}
				<div className="mt-10 flex items-center justify-center gap-4">
					<span className={`text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-colors ${!showRedacted ? "text-fd-foreground" : "text-fd-muted-foreground"}`}>
						Original
					</span>
					<button
						type="button"
						data-tour="before-after-toggle"
						onClick={() => setShowRedacted(!showRedacted)}
						className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
							showRedacted ? "bg-red-500" : "bg-fd-muted-foreground/25"
						}`}
					>
						<span
							className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-300 shadow-sm ${
								showRedacted ? "translate-x-6" : "translate-x-1"
							}`}
						/>
					</button>
					<span className={`text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-colors ${showRedacted ? "text-fd-foreground" : "text-fd-muted-foreground"}`}>
						Redacted
					</span>
				</div>

				{/* Data table */}
				<div className="mt-10 rounded-2xl border border-fd-border bg-fd-card/80 backdrop-blur-sm overflow-hidden">
					{rows.map((row, i) => (
						<div
							key={row.label}
							className={`flex items-center ${i < rows.length - 1 ? "border-b border-fd-border/50" : ""}`}
						>
							<div className="w-20 shrink-0 border-r border-fd-border/50 px-5 py-4 sm:w-28">
								<span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-fd-muted-foreground">
									{row.label}
								</span>
							</div>
							<div className="flex-1 px-5 py-4">
								<span className={`font-[family-name:var(--font-mono)] text-[14px] transition-all duration-500 ${
									showRedacted ? "text-red-400" : "text-fd-foreground"
								}`}>
									{showRedacted ? row.fake : row.real}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
