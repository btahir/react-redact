"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { tourSteps } from "./tour-steps";

interface TourState {
	isActive: boolean;
	currentStep: number;
	isTransitioning: boolean;
}

interface TourContextValue extends TourState {
	startTour: () => void;
	endTour: () => void;
	goToStep: (step: number) => void;
	totalSteps: number;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
	const ctx = useContext(TourContext);
	if (!ctx) throw new Error("useTour must be used within TourProvider");
	return ctx;
}

export function TourProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<TourState>({
		isActive: false,
		currentStep: 0,
		isTransitioning: false,
	});

	const abortRef = useRef<AbortController | null>(null);
	const stateRef = useRef(state);
	stateRef.current = state;

	const endTour = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setState({ isActive: false, currentStep: 0, isTransitioning: false });
	}, []);

	const runStepAction = useCallback(
		async (stepIndex: number, signal: AbortSignal) => {
			const step = tourSteps[stepIndex];
			if (!step?.action) return;
			await new Promise<void>((resolve, reject) => {
				const t = setTimeout(resolve, 400);
				signal.addEventListener("abort", () => {
					clearTimeout(t);
					reject(new DOMException("Aborted", "AbortError"));
				});
			});
			if (signal.aborted) return;
			await step.action(signal);
		},
		[],
	);

	const goToStep = useCallback(
		async (stepIndex: number) => {
			if (stepIndex < 0 || stepIndex >= tourSteps.length) return;

			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			// Mark transitioning — hides tooltip, spotlight tracks instantly
			setState((s) => ({
				...s,
				isTransitioning: true,
				currentStep: stepIndex,
			}));

			const step = tourSteps[stepIndex];

			if (step.target) {
				const el = document.querySelector(
					`[data-tour="${step.target}"]`,
				);
				if (el) {
					el.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
					// Wait for scroll to finish
					await new Promise((r) => setTimeout(r, 500));
				}
			} else {
				window.scrollTo({ top: 0, behavior: "smooth" });
				await new Promise((r) => setTimeout(r, 350));
			}

			if (controller.signal.aborted) return;

			// Scroll done — show tooltip
			setState((s) => ({ ...s, isTransitioning: false }));

			try {
				await runStepAction(stepIndex, controller.signal);
			} catch {
				// Aborted
			}
		},
		[runStepAction],
	);

	const startTour = useCallback(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		setState({ isActive: true, currentStep: 0, isTransitioning: false });
	}, []);

	// Keyboard navigation
	useEffect(() => {
		if (!state.isActive) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			const cur = stateRef.current.currentStep;
			switch (e.key) {
				case "Escape":
					endTour();
					break;
				case "ArrowRight":
					if (cur >= tourSteps.length - 1) {
						endTour();
					} else {
						goToStep(cur + 1);
					}
					break;
				case "ArrowLeft":
					if (cur > 0) {
						goToStep(cur - 1);
					}
					break;
			}
		};

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
		};
		const handleTouchMove = (e: TouchEvent) => {
			e.preventDefault();
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("wheel", handleWheel, { passive: false });
		window.addEventListener("touchmove", handleTouchMove, {
			passive: false,
		});

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("touchmove", handleTouchMove);
		};
	}, [state.isActive, endTour, goToStep]);

	const value = useMemo<TourContextValue>(
		() => ({
			...state,
			startTour,
			endTour,
			goToStep,
			totalSteps: tourSteps.length,
		}),
		[state, startTour, endTour, goToStep],
	);

	return (
		<TourContext.Provider value={value}>{children}</TourContext.Provider>
	);
}
