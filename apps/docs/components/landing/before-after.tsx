"use client";

import { useState } from "react";

const rows = [
	{ label: "Name", real: "Sarah Johnson", fake: "Jane Demo" },
	{ label: "Email", real: "sarah.j@acme.corp", fake: "jane.demo@example.com" },
	{ label: "Phone", real: "(415) 555-0198", fake: "(555) 200-4321" },
	{ label: "Card", real: "4532 8901 2345 6789", fake: "•••• •••• •••• ••••" },
	{ label: "IP", real: "192.168.1.42", fake: "10.0.0.1" },
];

export function BeforeAfter() {
	const [showRedacted, setShowRedacted] = useState(false);

	return (
		<section className="px-6 py-16 bg-fd-muted/30">
			<div className="mx-auto max-w-3xl">
				<h2 className="text-center text-2xl font-bold text-fd-foreground md:text-3xl">
					Before & After
				</h2>
				<p className="mx-auto mt-3 max-w-lg text-center text-fd-muted-foreground">
					See how your data looks with redaction enabled. Toggle to compare.
				</p>

				{/* Toggle */}
				<div className="mt-8 flex justify-center">
					<button
						type="button"
						onClick={() => setShowRedacted(!showRedacted)}
						className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
							showRedacted ? "bg-fd-primary" : "bg-fd-muted-foreground/30"
						}`}
					>
						<span
							className={`inline-block h-6 w-6 rounded-full bg-white transition-transform shadow-sm ${
								showRedacted ? "translate-x-7" : "translate-x-1"
							}`}
						/>
					</button>
					<span className="ml-3 text-sm font-medium text-fd-foreground">
						{showRedacted ? "Redacted (demo-safe)" : "Original (PII visible)"}
					</span>
				</div>

				{/* Table */}
				<div className="mt-8 rounded-xl border border-fd-border bg-fd-card overflow-hidden">
					<div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] divide-y divide-fd-border">
						{rows.map((row) => (
							<div key={row.label} className="contents">
								<div className="flex items-center px-4 py-3 text-sm font-medium text-fd-muted-foreground border-r border-fd-border">
									{row.label}
								</div>
								<div className="flex items-center px-4 py-3 font-mono text-sm text-fd-foreground transition-all duration-300">
									{showRedacted ? (
										<span className="text-fd-primary">{row.fake}</span>
									) : (
										<span>{row.real}</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
