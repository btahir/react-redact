import Link from "next/link";

export default function Home() {
	return (
		<main className="docs-main" style={{ padding: "4rem 2rem", textAlign: "center" }}>
			<h1>react-redact</h1>
			<p style={{ color: "#666", marginBottom: "1.5rem" }}>
				One keyboard shortcut to make your entire app demo-safe.
			</p>
			<Link
				href="/docs"
				style={{
					display: "inline-block",
					background: "#333",
					color: "#fff",
					padding: "0.5rem 1.25rem",
					borderRadius: "6px",
					textDecoration: "none",
				}}
			>
				Documentation
			</Link>
		</main>
	);
}
