"use client";

import { Hero } from "@/components/landing/hero";
import { InstallCommand } from "@/components/landing/install-command";
import { FeatureCards } from "@/components/landing/feature-cards";
import { BeforeAfter } from "@/components/landing/before-after";
import { CodeExample } from "@/components/landing/code-example";
import { Footer } from "@/components/landing/footer";
import { TourProvider } from "@/components/landing/tour/tour-provider";
import { TourOverlay } from "@/components/landing/tour/tour-overlay";

export default function Home() {
	return (
		<TourProvider>
			<main className="min-h-screen">
				<Hero />
				<InstallCommand />
				<FeatureCards />
				<BeforeAfter />
				<CodeExample />
				<Footer />
			</main>
			<TourOverlay />
		</TourProvider>
	);
}
