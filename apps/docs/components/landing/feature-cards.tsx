const features = [
	{
		number: "01",
		title: "Toggle Anything",
		description:
			"Keyboard shortcut, hook, or URL param. One line to wire up, one keystroke to activate.",
		detail: "⌘⇧X",
	},
	{
		number: "02",
		title: "Three Modes",
		description:
			"Blur hides instantly. Mask replaces with bullets. Replace generates deterministic fake data.",
		detail: "blur | mask | replace",
	},
	{
		number: "03",
		title: "Auto-Detect",
		description:
			"RedactAuto scans DOM subtrees for email, phone, SSN, credit card, IP. Custom regex supported.",
		detail: "5 built-in patterns",
	},
	{
		number: "04",
		title: "Zero Dependencies",
		description:
			"React is the only peer dep. ESM + CJS dual output, tree-shakeable, 3.3 kB gzipped.",
		detail: "3.3 kB",
	},
];

export function FeatureCards() {
	return (
		<section className="px-6 py-24">
			<div className="mx-auto max-w-4xl">
				<p className="text-center text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-red-500 font-semibold">
					Capabilities
				</p>
				<h2 className="mt-4 text-center font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight text-fd-foreground md:text-4xl">
					Everything you need,
					<br />
					nothing you don&apos;t
				</h2>

				<div className="mt-14 grid gap-px sm:grid-cols-2 rounded-2xl border border-fd-border overflow-hidden bg-fd-border">
					{features.map((f) => (
						<div
							key={f.number}
							className="group relative bg-fd-card p-8 transition-colors duration-300 hover:bg-fd-muted/50"
						>
							{/* Number */}
							<span className="text-[11px] font-[family-name:var(--font-mono)] font-bold tracking-[0.2em] text-red-500">
								{f.number}
							</span>

							<h3 className="mt-4 font-[family-name:var(--font-sora)] text-xl font-bold text-fd-foreground">
								{f.title}
							</h3>
							<p className="mt-3 text-[14px] leading-relaxed text-fd-muted-foreground">
								{f.description}
							</p>

							{/* Detail tag */}
							<div className="mt-5">
								<span className="inline-block rounded-md bg-fd-muted px-3 py-1 text-[11px] font-[family-name:var(--font-mono)] tracking-wider text-fd-muted-foreground">
									{f.detail}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
