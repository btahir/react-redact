"use client";

import { RedactProvider, Redact, useRedactMode } from "react-redact";
import "react-redact/styles.css";
import { useState } from "react";

type Mode = "blur" | "mask" | "replace";

function DemoToggleInner() {
	const { isRedacted, toggle } = useRedactMode();
	return (
		<div style={{ marginTop: "1rem" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
				<button
					type="button"
					onClick={toggle}
					style={{
						padding: "0.5rem 1rem",
						borderRadius: "6px",
						border: "1px solid var(--color-fd-border, #ccc)",
						background: isRedacted ? "var(--color-fd-primary, #333)" : "var(--color-fd-card, #fff)",
						color: isRedacted ? "var(--color-fd-primary-foreground, #fff)" : "var(--color-fd-foreground, #333)",
						cursor: "pointer",
						fontWeight: 500,
						fontSize: "0.875rem",
					}}
				>
					{isRedacted ? "🔒 Show real data" : "🔓 Enable demo mode"}
				</button>
				<span style={{ fontSize: "0.8rem", color: "var(--color-fd-muted-foreground, #666)" }}>
					or press <kbd style={{
						padding: "0.15rem 0.4rem",
						borderRadius: "4px",
						border: "1px solid var(--color-fd-border, #ddd)",
						background: "var(--color-fd-muted, #f5f5f5)",
						fontFamily: "monospace",
						fontSize: "0.75rem",
					}}>⌘⇧X</kbd> / <kbd style={{
						padding: "0.15rem 0.4rem",
						borderRadius: "4px",
						border: "1px solid var(--color-fd-border, #ddd)",
						background: "var(--color-fd-muted, #f5f5f5)",
						fontFamily: "monospace",
						fontSize: "0.75rem",
					}}>Ctrl+Shift+X</kbd>
				</span>
			</div>
			<div
				style={{
					marginTop: "1rem",
					padding: "1rem",
					background: "var(--color-fd-card, #f8f8f8)",
					borderRadius: "8px",
					border: "1px solid var(--color-fd-border, #eee)",
					display: "grid",
					gap: "0.5rem",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<span style={{ fontSize: "0.8rem", color: "var(--color-fd-muted-foreground, #888)" }}>Email</span>
					<span style={{ fontFamily: "monospace", fontSize: "0.875rem" }}><Redact>sarah.j@acme.corp</Redact></span>
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<span style={{ fontSize: "0.8rem", color: "var(--color-fd-muted-foreground, #888)" }}>Phone</span>
					<span style={{ fontFamily: "monospace", fontSize: "0.875rem" }}><Redact>(415) 555-0198</Redact></span>
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<span style={{ fontSize: "0.8rem", color: "var(--color-fd-muted-foreground, #888)" }}>Card</span>
					<span style={{ fontFamily: "monospace", fontSize: "0.875rem" }}><Redact>4532 8901 2345 6789</Redact></span>
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<span style={{ fontSize: "0.8rem", color: "var(--color-fd-muted-foreground, #888)" }}>SSN</span>
					<span style={{ fontFamily: "monospace", fontSize: "0.875rem" }}><Redact>423-91-8847</Redact></span>
				</div>
			</div>
		</div>
	);
}

export function DemoToggle() {
	const [mode, setMode] = useState<Mode>("blur");

	return (
		<div>
			<div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
				{(["blur", "mask", "replace"] as const).map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => setMode(m)}
						style={{
							padding: "0.25rem 0.75rem",
							borderRadius: "4px",
							border: "none",
							background: mode === m ? "var(--color-fd-primary, #333)" : "transparent",
							color: mode === m ? "var(--color-fd-primary-foreground, #fff)" : "var(--color-fd-muted-foreground, #666)",
							cursor: "pointer",
							fontSize: "0.8rem",
							fontWeight: 500,
							textTransform: "capitalize",
						}}
					>
						{m}
					</button>
				))}
			</div>
			<RedactProvider shortcut="mod+shift+x" mode={mode}>
				<DemoToggleInner />
			</RedactProvider>
		</div>
	);
}
