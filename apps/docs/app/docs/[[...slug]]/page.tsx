import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import { DemoToggle } from "@/components/demo/demo-toggle";

const CONTENT_DIR = path.join(process.cwd(), "content/docs");

const slugToPath: Record<string, string> = {
	"": "index.mdx",
	"getting-started": "index.mdx",
	components: "components/redact.mdx",
	"components/redact": "components/redact.mdx",
	"components/redact-auto": "components/redact-auto.mdx",
	"components/provider": "components/provider.mdx",
	hooks: "hooks/use-redact-mode.mdx",
	"hooks/use-redact-mode": "hooks/use-redact-mode.mdx",
	"hooks/use-redact-patterns": "hooks/use-redact-patterns.mdx",
	modes: "modes.mdx",
	patterns: "patterns.mdx",
	recipes: "recipes.mdx",
};

type PageProps = { params: Promise<{ slug?: string[] }> };

export default async function DocPage(props: PageProps) {
	const params = await props.params;
	const slug = params.slug?.join("/") ?? "";
	const filePath = slugToPath[slug];
	if (!filePath) notFound();

	const fullPath = path.join(CONTENT_DIR, filePath);
	if (!fs.existsSync(fullPath)) notFound();

	const raw = fs.readFileSync(fullPath, "utf-8");
	const { data: frontmatter, content } = matter(raw);

	const isGettingStarted = slug === "" || slug === "getting-started";

	return (
		<>
			<h1>{frontmatter.title ?? "Docs"}</h1>
			{frontmatter.description && (
				<p style={{ color: "#666", marginBottom: "1.5rem" }}>{frontmatter.description}</p>
			)}
			<ReactMarkdown>{content}</ReactMarkdown>
			{isGettingStarted && (
				<section style={{ marginTop: "2rem", padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px" }}>
					<h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Live demo</h2>
					<DemoToggle />
				</section>
			)}
		</>
	);
}

export async function generateStaticParams() {
	return Object.keys(slugToPath).map((slug) => ({
		slug: slug ? slug.split("/") : [],
	}));
}

export async function generateMetadata(props: PageProps) {
	const params = await props.params;
	const slug = params.slug?.join("/") ?? "";
	const filePath = slugToPath[slug];
	if (!filePath) return { title: "Docs" };
	const fullPath = path.join(CONTENT_DIR, filePath);
	if (!fs.existsSync(fullPath)) return { title: "Docs" };
	const raw = fs.readFileSync(fullPath, "utf-8");
	const { data } = matter(raw);
	return {
		title: `${data.title ?? "Docs"} | react-redact`,
		description: data.description,
	};
}
