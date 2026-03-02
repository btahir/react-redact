export type Placement = "top" | "bottom" | "left" | "right";

export interface TourStep {
	/** data-tour attribute value of the target element, or null for centered overlay */
	target: string | null;
	title: string;
	description: string;
	placement: Placement;
	/** Extra padding around spotlight (px) */
	padding: number;
	/** Border radius for spotlight (px) */
	borderRadius: number;
	/** Auto-action to run after spotlight settles */
	action?: (signal: AbortSignal) => Promise<void>;
}

function waitMs(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const t = setTimeout(resolve, ms);
		signal.addEventListener("abort", () => {
			clearTimeout(t);
			reject(new DOMException("Aborted", "AbortError"));
		});
	});
}

function clickElement(selector: string) {
	const el = document.querySelector(selector) as HTMLElement | null;
	el?.click();
}

// Steps follow page order: Hero → InstallCommand → FeatureCards → BeforeAfter → CodeExample
export const tourSteps: TourStep[] = [
	// Step 0: Welcome (centered, no target)
	{
		target: null,
		title: "Welcome to react-redact",
		description:
			"Take a quick tour to see how one component can protect every piece of sensitive data in your app. Use arrow keys or click Next.",
		placement: "bottom",
		padding: 0,
		borderRadius: 16,
	},

	// Step 1: Hero toggle
	{
		target: "hero-toggle",
		title: "One click hides everything",
		description:
			"This toggle activates redaction across the entire demo. In your app, it's a keyboard shortcut — ⌘⇧X.",
		placement: "bottom",
		padding: 8,
		borderRadius: 10,
		action: async (signal) => {
			const btn = document.querySelector(
				'[data-tour="hero-toggle"]',
			) as HTMLElement | null;
			if (btn && btn.textContent?.trim() === "VISIBLE") {
				btn.click();
				await waitMs(600, signal);
			}
		},
	},

	// Step 2: Mode switcher
	{
		target: "hero-modes",
		title: "Three ways to protect data",
		description:
			"Blur hides instantly. Mask replaces with bullets. Replace generates fake but realistic values.",
		placement: "bottom",
		padding: 6,
		borderRadius: 8,
		action: async (signal) => {
			for (const mode of ["blur", "mask", "replace"]) {
				clickElement(`[data-tour="mode-${mode}"]`);
				await waitMs(800, signal);
			}
		},
	},

	// Step 3: Email row
	{
		target: "hero-row-email",
		title: "See the redaction up close",
		description:
			'This is a real <Redact> component in action. The original value "sarah.johnson@acme.corp" is visually hidden — the DOM never leaks it.',
		placement: "top",
		padding: 4,
		borderRadius: 0,
	},

	// Step 4: Install command (next section down)
	{
		target: "install-block",
		title: "Ready to try it?",
		description:
			"Install with your favorite package manager. Zero dependencies, 3.3 kB gzipped, ESM + CJS.",
		placement: "bottom",
		padding: 8,
		borderRadius: 12,
	},

	// Step 5: Auto-Detect feature card
	{
		target: "feature-auto-detect",
		title: "No manual wrapping needed",
		description:
			"RedactAuto scans DOM subtrees for emails, phone numbers, SSNs, credit cards, and IPs. Add custom regex patterns too.",
		placement: "right",
		padding: 6,
		borderRadius: 12,
	},

	// Step 6: Before/After toggle
	{
		target: "before-after-toggle",
		title: "See the full picture",
		description:
			"Toggle between original and redacted views. In replace mode, each value gets a deterministic fake — consistent across renders.",
		placement: "top",
		padding: 8,
		borderRadius: 20,
		action: async (signal) => {
			const btn = document.querySelector(
				'[data-tour="before-after-toggle"]',
			) as HTMLElement | null;
			if (btn) {
				btn.click();
				await waitMs(800, signal);
			}
		},
	},

	// Step 7: Code example (last section)
	{
		target: "code-block",
		title: "10 lines to get started",
		description:
			"Wrap your app in RedactProvider, mark sensitive text with <Redact>, and you're done. Zero config required.",
		placement: "top",
		padding: 8,
		borderRadius: 16,
	},
];
