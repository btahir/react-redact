import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-fd-border px-6 py-14">
			<div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
				{/* Brand */}
				<div className="text-center">
					<div className="font-[family-name:var(--font-sora)] text-lg font-bold tracking-tight text-fd-foreground">
						react-redact
					</div>
					<p className="mt-1.5 text-[13px] text-fd-muted-foreground">
						One shortcut to make your app demo-safe.
					</p>
				</div>

				{/* Links */}
				<nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[13px] font-[family-name:var(--font-mono)] text-fd-muted-foreground">
					<Link href="/docs" className="transition-colors hover:text-fd-foreground">
						Docs
					</Link>
					<a
						href="https://github.com/btahir/react-redact"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors hover:text-fd-foreground"
					>
						GitHub
					</a>
					<a
						href="https://www.npmjs.com/package/react-redact"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors hover:text-fd-foreground"
					>
						npm
					</a>
					<a
						href="https://github.com/btahir/react-redact/blob/main/LICENSE"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors hover:text-fd-foreground"
					>
						MIT License
					</a>
				</nav>

				{/* Divider + credit */}
				<div className="h-px w-16 bg-fd-border" />
				<div className="text-[12px] text-fd-muted-foreground/60">
					Built by{" "}
					<a
						href="https://github.com/btahir"
						target="_blank"
						rel="noopener noreferrer"
						className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
					>
						Bilal Tahir
					</a>
				</div>
			</div>
		</footer>
	);
}
