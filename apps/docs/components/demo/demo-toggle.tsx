"use client";

import { RedactProvider, Redact, useRedactMode } from "react-redact";
import "react-redact/styles.css";

function DemoToggleInner() {
	const { isRedacted, toggle } = useRedactMode();
	return (
		<div style={{ marginTop: "1rem" }}>
			<button
				type="button"
				onClick={toggle}
				style={{
					padding: "0.5rem 1rem",
					borderRadius: "6px",
					border: "1px solid #ccc",
					background: isRedacted ? "#333" : "#fff",
					color: isRedacted ? "#fff" : "#333",
					cursor: "pointer",
				}}
			>
				{isRedacted ? "🔒 Show real data" : "🔓 Enable demo mode"}
			</button>
			<p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#666" }}>
				Or press <kbd>⌘⇧X</kbd> (Mac) / <kbd>Ctrl+Shift+X</kbd> (Windows/Linux)
			</p>
			<div style={{ marginTop: "1rem", padding: "1rem", background: "#f8f8f8", borderRadius: "8px" }}>
				<strong>Sample data:</strong> <Redact>user@company.com</Redact>,{" "}
				<Redact>(555) 123-4567</Redact>, <Redact>4111 1111 1111 1111</Redact>
			</div>
		</div>
	);
}

export function DemoToggle() {
	return (
		<RedactProvider shortcut="mod+shift+x">
			<DemoToggleInner />
		</RedactProvider>
	);
}
