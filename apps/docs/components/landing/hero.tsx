"use client";

import Link from "next/link";
import { useState } from "react";

const sampleData = {
	blur: [
		{ label: "Email", value: "sarah.johnson@acme.corp" },
		{ label: "Phone", value: "(415) 555-0198" },
		{ label: "SSN", value: "423-91-8847" },
		{ label: "Card", value: "4532 8901 2345 6789" },
	],
	mask: [
		{ label: "Email", value: "sarah.johnson@acme.corp" },
		{ label: "Phone", value: "(415) 555-0198" },
		{ label: "SSN", value: "423-91-8847" },
		{ label: "Card", value: "4532 8901 2345 6789" },
	],
	replace: [
		{ label: "Email", value: "jane.doe@example.com" },
		{ label: "Phone", value: "(555) 200-1234" },
		{ label: "SSN", value: "457-31-6802" },
		{ label: "Card", value: "•••• •••• •••• ••••" },
	],
};

type Mode = "blur" | "mask" | "replace";

function maskValue(text: string): string {
	return "•".repeat(text.length);
}

function RedactedValue({ value, mode, redacted }: { value: string; mode: Mode; redacted: boolean }) {
	if (!redacted) {
		return <span className="transition-all duration-300">{value}</span>;
	}

	if (mode === "blur") {
		return (
			<span className="blur-[6px] select-none transition-all duration-300">
				{value}
			</span>
		);
	}

	if (mode === "mask") {
		return (
			<span className="select-none transition-all duration-300 tracking-tight">
				{maskValue(value)}
			</span>
		);
	}

	return <span className="transition-all duration-300">{value}</span>;
}

export function Hero() {
	const [redacted, setRedacted] = useState(false);
	const [mode, setMode] = useState<Mode>("blur");

	const data = mode === "replace" && redacted ? sampleData.replace : sampleData.blur;

	return (
		<section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-28 md:pb-20">
			{/* Background gradient */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-fd-primary/5 blur-3xl" />
			</div>

			<div className="mx-auto max-w-4xl text-center">
				{/* Badge */}
				<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-4 py-1.5 text-sm text-fd-muted-foreground">
					<span className="inline-block h-2 w-2 rounded-full bg-green-500" />
					v0.1.0 — Zero dependencies
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-6xl">
					One keyboard shortcut to make
					<br />
					your entire app{" "}
					<span className="bg-gradient-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent">
						demo-safe
					</span>
				</h1>

				<p className="mx-auto mt-6 max-w-2xl text-lg text-fd-muted-foreground md:text-xl">
					Zero-dependency React components that visually hide PII — for demos,
					screenshares, and presentations. Press{" "}
					<kbd className="rounded border border-fd-border bg-fd-muted px-1.5 py-0.5 font-mono text-sm">
						⌘⇧X
					</kbd>{" "}
					and you&apos;re done.
				</p>

				{/* CTAs */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/docs"
						className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
					>
						Get Started
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
							<title>Arrow right</title>
							<path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</Link>
					<a
						href="https://github.com/bilal-tahir-Invoworx/react-redact"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-6 py-3 font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<title>GitHub</title>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						View on GitHub
					</a>
				</div>

				{/* Interactive Demo */}
				<div className="mx-auto mt-14 max-w-xl">
					<div className="rounded-xl border border-fd-border bg-fd-card shadow-lg overflow-hidden">
						{/* Demo header */}
						<div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
							<div className="flex items-center gap-2">
								<div className="flex gap-1.5">
									<div className="h-3 w-3 rounded-full bg-red-400/80" />
									<div className="h-3 w-3 rounded-full bg-yellow-400/80" />
									<div className="h-3 w-3 rounded-full bg-green-400/80" />
								</div>
								<span className="ml-2 text-sm text-fd-muted-foreground">
									Customer Dashboard
								</span>
							</div>
							<button
								type="button"
								onClick={() => setRedacted(!redacted)}
								className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
									redacted
										? "bg-fd-primary text-fd-primary-foreground"
										: "bg-fd-muted text-fd-muted-foreground hover:text-fd-foreground"
								}`}
							>
								{redacted ? "🔒 Redacted" : "🔓 Visible"}
							</button>
						</div>

						{/* Mode selector */}
						<div className="flex gap-1 border-b border-fd-border px-4 py-2">
							{(["blur", "mask", "replace"] as const).map((m) => (
								<button
									key={m}
									type="button"
									onClick={() => setMode(m)}
									className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
										mode === m
											? "bg-fd-primary/10 text-fd-primary"
											: "text-fd-muted-foreground hover:text-fd-foreground"
									}`}
								>
									{m}
								</button>
							))}
						</div>

						{/* Sample data */}
						<div className="divide-y divide-fd-border">
							{data.map((item) => (
								<div key={item.label} className="flex items-center justify-between px-4 py-3">
									<span className="text-sm text-fd-muted-foreground">
										{item.label}
									</span>
									<span className="font-mono text-sm text-fd-foreground">
										<RedactedValue
											value={item.value}
											mode={mode}
											redacted={redacted}
										/>
									</span>
								</div>
							))}
						</div>
					</div>
					<p className="mt-3 text-sm text-fd-muted-foreground">
						Try it — click the toggle or switch modes
					</p>
				</div>
			</div>
		</section>
	);
}
