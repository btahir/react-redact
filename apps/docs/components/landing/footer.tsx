import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-fd-border px-6 py-10">
			<div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
				<div className="text-sm text-fd-muted-foreground">
					Built by{" "}
					<a
						href="https://github.com/bilal-tahir-Invoworx"
						target="_blank"
						rel="noopener noreferrer"
						className="text-fd-foreground hover:underline"
					>
						Bilal Tahir
					</a>
				</div>
				<nav className="flex gap-6 text-sm text-fd-muted-foreground">
					<Link href="/docs" className="hover:text-fd-foreground transition-colors">
						Docs
					</Link>
					<a
						href="https://github.com/bilal-tahir-Invoworx/react-redact"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-fd-foreground transition-colors"
					>
						GitHub
					</a>
					<a
						href="https://www.npmjs.com/package/react-redact"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-fd-foreground transition-colors"
					>
						npm
					</a>
					<a
						href="https://github.com/bilal-tahir-Invoworx/react-redact/blob/main/LICENSE"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-fd-foreground transition-colors"
					>
						MIT License
					</a>
				</nav>
			</div>
		</footer>
	);
}
