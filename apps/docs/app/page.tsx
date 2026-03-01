import { Hero } from "@/components/landing/hero";
import { InstallCommand } from "@/components/landing/install-command";
import { FeatureCards } from "@/components/landing/feature-cards";
import { BeforeAfter } from "@/components/landing/before-after";
import { CodeExample } from "@/components/landing/code-example";
import { Footer } from "@/components/landing/footer";

export default function Home() {
	return (
		<main className="min-h-screen">
			<Hero />
			<InstallCommand />
			<FeatureCards />
			<BeforeAfter />
			<CodeExample />
			<Footer />
		</main>
	);
}
