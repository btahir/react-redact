"use client";

import { useState } from "react";

const lines = [
	{ code: 'import { RedactProvider, Redact, useRedactMode } from "react-redact";', type: "import" },
	{ code: 'import "react-redact/styles.css";', type: "import" },
	{ code: "", type: "blank" },
	{ code: "function App() {", type: "keyword" },
	{ code: "  return (", type: "default" },
	{ code: '    <RedactProvider shortcut="mod+shift+x">', type: "jsx" },
	{ code: "      <Dashboard />", type: "jsx" },
	{ code: "    </RedactProvider>", type: "jsx" },
	{ code: "  );", type: "default" },
	{ code: "}", type: "keyword" },
	{ code: "", type: "blank" },
	{ code: "function Dashboard() {", type: "keyword" },
	{ code: "  const { isRedacted, toggle } = useRedactMode();", type: "default" },
	{ code: "  return (", type: "default" },
	{ code: "    <>", type: "jsx" },
	{ code: "      <button onClick={toggle}>", type: "jsx" },
	{ code: '        {isRedacted ? "Redacted" : "Visible"}', type: "default" },
	{ code: "      </button>", type: "jsx" },
	{ code: "      <p>Email: <Redact>user@company.com</Redact></p>", type: "jsx" },
	{ code: "    </>", type: "jsx" },
	{ code: "  );", type: "default" },
	{ code: "}", type: "keyword" },
];

const rawCode = lines.map((l) => l.code).join("\n");

function getLineColor(type: string): string {
	switch (type) {
		case "import":
			return "text-red-400";
		case "keyword":
			return "text-fd-foreground font-semibold";
		case "jsx":
			return "text-fd-foreground/80";
		default:
			return "text-fd-muted-foreground";
	}
}

export function CodeExample() {
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(rawCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section className="px-6 py-24">
			<div className="mx-auto max-w-2xl">
				<p className="text-center text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-red-500 font-semibold">
					Quick start
				</p>
				<h2 className="mt-4 text-center font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight text-fd-foreground md:text-4xl">
					Running in 10 lines
				</h2>
				<p className="mx-auto mt-4 max-w-md text-center text-[15px] text-fd-muted-foreground">
					Wrap your app, mark the sensitive bits, toggle with a shortcut.
				</p>

				<div data-tour="code-block" className="relative mt-10 rounded-2xl border border-fd-border bg-fd-card/80 backdrop-blur-sm overflow-hidden">
					{/* Header bar */}
					<div className="flex items-center justify-between border-b border-fd-border/50 px-5 py-3">
						<div className="flex items-center gap-3">
							<div className="flex gap-1.5">
								<div className="h-2.5 w-2.5 rounded-full bg-fd-muted-foreground/20" />
								<div className="h-2.5 w-2.5 rounded-full bg-fd-muted-foreground/20" />
								<div className="h-2.5 w-2.5 rounded-full bg-fd-muted-foreground/20" />
							</div>
							<span className="text-[12px] font-[family-name:var(--font-mono)] text-fd-muted-foreground">
								App.tsx
							</span>
						</div>
						<button
							type="button"
							onClick={copy}
							className={`rounded-md px-3 py-1 text-[12px] font-[family-name:var(--font-mono)] transition-all duration-200 ${
								copied
									? "bg-emerald-500/10 text-emerald-500"
									: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted"
							}`}
						>
							{copied ? "Copied!" : "Copy"}
						</button>
					</div>

					{/* Code with line numbers */}
					<div className="overflow-x-auto">
						<pre className="px-5 py-4 text-[13px] leading-[1.7]">
							{lines.map((line, i) => (
								<div key={`line-${i}-${line.type}`} className="flex">
									<span className="w-8 shrink-0 select-none text-right text-fd-muted-foreground/40 font-[family-name:var(--font-mono)]">
										{i + 1}
									</span>
									<span className={`ml-4 font-[family-name:var(--font-mono)] ${getLineColor(line.type)}`}>
										{line.code || "\u00A0"}
									</span>
								</div>
							))}
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
