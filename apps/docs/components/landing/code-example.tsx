"use client";

import { useState } from "react";

const code = `import { RedactProvider, Redact, useRedactMode } from "react-redact";
import "react-redact/styles.css";

function App() {
  return (
    <RedactProvider shortcut="mod+shift+x">
      <Dashboard />
    </RedactProvider>
  );
}

function Dashboard() {
  const { isRedacted, toggle } = useRedactMode();
  return (
    <>
      <button onClick={toggle}>
        {isRedacted ? "🔒" : "🔓"} Demo mode
      </button>
      <p>Email: <Redact>user@company.com</Redact></p>
      <p>Phone: <Redact>(555) 123-4567</Redact></p>
    </>
  );
}`;

export function CodeExample() {
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section className="px-6 py-16">
			<div className="mx-auto max-w-2xl">
				<h2 className="text-center text-2xl font-bold text-fd-foreground md:text-3xl">
					Up and running in 10 lines
				</h2>
				<p className="mx-auto mt-3 max-w-lg text-center text-fd-muted-foreground">
					Wrap your app, mark sensitive content, and toggle with a keyboard shortcut.
				</p>
				<div className="relative mt-8 rounded-xl border border-fd-border bg-fd-card overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-fd-border px-4 py-2">
						<span className="text-sm text-fd-muted-foreground">App.tsx</span>
						<button
							type="button"
							onClick={copy}
							className="rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
							aria-label="Copy code"
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
					{/* Code */}
					<pre className="overflow-x-auto p-4 text-sm leading-relaxed">
						<code className="font-mono text-fd-foreground">{code}</code>
					</pre>
				</div>
			</div>
		</section>
	);
}
