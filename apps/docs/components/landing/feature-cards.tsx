const features = [
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<title>Toggle</title>
				<rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
				<circle cx="16" cy="12" r="3" />
			</svg>
		),
		title: "Toggle Anything",
		description:
			"Keyboard shortcut (⌘⇧X), useRedactMode() hook, or ?redact=true URL param. Your choice.",
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<title>Modes</title>
				<path d="M4 4h16v16H4z" />
				<path d="M4 12h16" />
				<path d="M12 4v16" />
			</svg>
		),
		title: "Three Modes",
		description:
			"Blur for quick hiding, mask with bullets for consistent lengths, or replace with deterministic fake data.",
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<title>Auto-detect</title>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
		),
		title: "Auto-Detect PII",
		description:
			"RedactAuto scans subtrees for email, phone, SSN, credit card, and IP addresses. Add custom regex too.",
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<title>Zero dependencies</title>
				<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
				<line x1="16" y1="8" x2="2" y2="22" />
				<line x1="17.5" y1="15" x2="9" y2="15" />
			</svg>
		),
		title: "Zero Dependencies",
		description:
			"React is the only peer dependency. ESM + CJS, tree-shakeable, tiny bundle size.",
	},
];

export function FeatureCards() {
	return (
		<section className="px-6 py-16">
			<div className="mx-auto max-w-4xl">
				<h2 className="text-center text-2xl font-bold text-fd-foreground md:text-3xl">
					Everything you need, nothing you don&apos;t
				</h2>
				<p className="mx-auto mt-3 max-w-xl text-center text-fd-muted-foreground">
					Built for the real-world scenario of hiding PII during live demos and
					screen recordings.
				</p>
				<div className="mt-10 grid gap-6 sm:grid-cols-2">
					{features.map((f) => (
						<div
							key={f.title}
							className="rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-fd-primary/30"
						>
							<div className="mb-3 inline-flex rounded-lg bg-fd-primary/10 p-2.5 text-fd-primary">
								{f.icon}
							</div>
							<h3 className="text-lg font-semibold text-fd-foreground">
								{f.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
								{f.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
