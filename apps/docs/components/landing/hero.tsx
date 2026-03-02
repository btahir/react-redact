"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const sampleData = [
	{ label: "Email", value: "sarah.johnson@acme.corp", masked: "•••••••••••••••••••••••" },
	{ label: "Phone", value: "(415) 555-0198", masked: "••••••••••••••" },
	{ label: "SSN", value: "423-91-8847", masked: "•••-••-••••" },
	{ label: "Card", value: "4532 8901 2345 6789", masked: "•••• •••• •••• ••••" },
];

type Mode = "blur" | "mask" | "replace";

const replacements: Record<string, string> = {
	"sarah.johnson@acme.corp": "jane.doe@example.com",
	"(415) 555-0198": "(555) 200-4321",
	"423-91-8847": "457-31-6802",
	"4532 8901 2345 6789": "•••• •••• •••• ••••",
};

function RedactedValue({ value, masked, mode, redacted }: { value: string; masked: string; mode: Mode; redacted: boolean }) {
	if (!redacted) {
		return <span className="transition-all duration-500 ease-out">{value}</span>;
	}
	if (mode === "blur") {
		return (
			<span className="blur-[8px] select-none transition-all duration-500 ease-out">{value}</span>
		);
	}
	if (mode === "mask") {
		return (
			<span className="select-none transition-all duration-500 ease-out tracking-[-0.02em]">{masked}</span>
		);
	}
	return (
		<span className="transition-all duration-500 ease-out text-red-400">{replacements[value] ?? value}</span>
	);
}

export function Hero() {
	const [redacted, setRedacted] = useState(false);
	const [mode, setMode] = useState<Mode>("blur");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const timer = setTimeout(() => setRedacted(true), 1800);
		return () => clearTimeout(timer);
	}, []);

	return (
		<section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-36 md:pb-28 landing-grain">
			{/* Dot grid background */}
			<div className="pointer-events-none absolute inset-0 -z-10 landing-dots" />

			{/* Gradient accent wash */}
			<div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2">
				<div className="h-full w-full rounded-full bg-red-500/[0.06] blur-[100px]" />
			</div>

			<div className="relative z-10 mx-auto max-w-5xl">
				{/* Badge */}
				<div
					className={`mb-8 flex justify-center ${mounted ? "landing-slide-up" : "opacity-0"}`}
					style={{ animationDelay: "0.1s" }}
				>
					<div className="inline-flex items-center gap-2.5 rounded-full border border-fd-border bg-fd-card/80 backdrop-blur-sm px-5 py-2 text-[13px] tracking-wide text-fd-muted-foreground font-[family-name:var(--font-mono)]">
						<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
						v0.1.0
						<span className="text-fd-border">|</span>
						zero dependencies
						<span className="text-fd-border">|</span>
						3.3 kB
					</div>
				</div>

				{/* Headline */}
				<h1
					className={`text-center font-[family-name:var(--font-sora)] text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-fd-foreground ${mounted ? "landing-reveal" : "opacity-0"}`}
					style={{ animationDelay: "0.2s" }}
				>
					One shortcut to make
					<br />
					your app{" "}
					<span className="landing-accent-bar text-red-500">
						demo-safe
					</span>
				</h1>

				{/* Subtitle */}
				<p
					className={`mx-auto mt-7 max-w-xl text-center text-lg leading-relaxed text-fd-muted-foreground ${mounted ? "landing-slide-up" : "opacity-0"}`}
					style={{ animationDelay: "0.4s" }}
				>
					React components that visually hide PII.
					<br className="hidden sm:block" />{" "}
					Press{" "}
					<kbd className="mx-0.5 rounded-[4px] border border-fd-border bg-fd-muted/80 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[13px] text-fd-foreground">
						⌘⇧X
					</kbd>{" "}
					and walk into any screenshare.
				</p>

				{/* CTAs */}
				<div
					className={`mt-10 flex flex-wrap items-center justify-center gap-4 ${mounted ? "landing-slide-up" : "opacity-0"}`}
					style={{ animationDelay: "0.55s" }}
				>
					<Link
						href="/docs"
						className="group relative inline-flex items-center gap-2 rounded-lg bg-red-500 px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-[0_0_24px_rgba(239,68,68,0.3)]"
					>
						Get Started
						<svg
							width="15"
							height="15"
							viewBox="0 0 16 16"
							fill="none"
							className="transition-transform duration-200 group-hover:translate-x-0.5"
						>
							<title>Arrow right</title>
							<path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</Link>
					<a
						href="https://github.com/btahir/react-redact"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2.5 rounded-lg border border-fd-border bg-fd-card/60 backdrop-blur-sm px-7 py-3.5 text-[15px] font-semibold text-fd-foreground transition-all duration-200 hover:bg-fd-muted hover:border-fd-muted-foreground/30"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<title>GitHub</title>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						GitHub
					</a>
				</div>

				{/* Interactive Demo Panel */}
				<div
					className={`mx-auto mt-16 max-w-lg ${mounted ? "landing-slide-up" : "opacity-0"}`}
					style={{ animationDelay: "0.7s" }}
				>
					<div className="rounded-2xl border border-fd-border bg-fd-card/80 backdrop-blur-md shadow-2xl shadow-black/5 overflow-hidden">
						{/* Window chrome */}
						<div className="flex items-center justify-between border-b border-fd-border px-5 py-3.5">
							<div className="flex items-center gap-3">
								<div className="flex gap-2">
									<div className="h-3 w-3 rounded-full bg-fd-muted-foreground/20" />
									<div className="h-3 w-3 rounded-full bg-fd-muted-foreground/20" />
									<div className="h-3 w-3 rounded-full bg-fd-muted-foreground/20" />
								</div>
								<span className="text-[13px] font-[family-name:var(--font-mono)] text-fd-muted-foreground">
									dashboard.tsx
								</span>
							</div>
							<button
								type="button"
								onClick={() => setRedacted(!redacted)}
								className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold font-[family-name:var(--font-mono)] tracking-wide transition-all duration-300 ${
									redacted
										? "bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.25)]"
										: "bg-fd-muted text-fd-muted-foreground hover:text-fd-foreground"
								}`}
							>
								{redacted ? "REDACTED" : "VISIBLE"}
							</button>
						</div>

						{/* Mode bar */}
						<div className="flex gap-0.5 border-b border-fd-border bg-fd-muted/30 px-5 py-2">
							{(["blur", "mask", "replace"] as const).map((m) => (
								<button
									key={m}
									type="button"
									onClick={() => setMode(m)}
									className={`rounded-md px-3.5 py-1 text-[12px] font-[family-name:var(--font-mono)] font-medium uppercase tracking-widest transition-all duration-200 ${
										mode === m
											? "bg-fd-foreground text-fd-background"
											: "text-fd-muted-foreground hover:text-fd-foreground"
									}`}
								>
									{m}
								</button>
							))}
						</div>

						{/* Data rows */}
						<div>
							{sampleData.map((item, i) => (
								<div
									key={item.label}
									className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
										i < sampleData.length - 1 ? "border-b border-fd-border/50" : ""
									}`}
								>
									<span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-widest text-fd-muted-foreground">
										{item.label}
									</span>
									<span className="font-[family-name:var(--font-mono)] text-[14px] text-fd-foreground">
										<RedactedValue
											value={item.value}
											masked={item.masked}
											mode={mode}
											redacted={redacted}
										/>
									</span>
								</div>
							))}
						</div>
					</div>
					<p className="mt-4 text-center text-[13px] text-fd-muted-foreground/70">
						Interactive — click toggle or switch modes
					</p>
				</div>
			</div>
		</section>
	);
}
