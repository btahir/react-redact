"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "./tour-provider";
import { tourSteps, type Placement } from "./tour-steps";

interface Rect {
	top: number;
	left: number;
	width: number;
	height: number;
}

const EMPTY_RECT: Rect = { top: 0, left: 0, width: 0, height: 0 };

function getTargetRect(target: string | null, padding: number): Rect | null {
	if (!target) return null;
	const el = document.querySelector(`[data-tour="${target}"]`);
	if (!el) return null;
	const r = el.getBoundingClientRect();
	return {
		top: r.top - padding,
		left: r.left - padding,
		width: r.width + padding * 2,
		height: r.height + padding * 2,
	};
}

function computePlacement(
	spotRect: Rect,
	tooltipW: number,
	tooltipH: number,
	preferred: Placement,
): { top: number; left: number; actual: Placement } {
	const gap = 16;
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const isMobile = vw < 640;

	const placements: Placement[] = isMobile
		? ["bottom", "top"]
		: [preferred, "bottom", "top", "right", "left"];

	for (const p of placements) {
		let top = 0;
		let left = 0;

		switch (p) {
			case "bottom":
				top = spotRect.top + spotRect.height + gap;
				left = spotRect.left + spotRect.width / 2 - tooltipW / 2;
				break;
			case "top":
				top = spotRect.top - tooltipH - gap;
				left = spotRect.left + spotRect.width / 2 - tooltipW / 2;
				break;
			case "right":
				top = spotRect.top + spotRect.height / 2 - tooltipH / 2;
				left = spotRect.left + spotRect.width + gap;
				break;
			case "left":
				top = spotRect.top + spotRect.height / 2 - tooltipH / 2;
				left = spotRect.left - tooltipW - gap;
				break;
		}

		// Clamp to viewport
		left = Math.max(12, Math.min(left, vw - tooltipW - 12));
		top = Math.max(12, Math.min(top, vh - tooltipH - 12));

		if (
			top >= 0 &&
			top + tooltipH <= vh &&
			left >= 0 &&
			left + tooltipW <= vw
		) {
			return { top, left, actual: p };
		}
	}

	return {
		top: spotRect.top + spotRect.height + gap,
		left: Math.max(12, (vw - tooltipW) / 2),
		actual: "bottom",
	};
}

function getCaretStyle(
	placement: Placement,
	spotRect: Rect,
	tooltipLeft: number,
	tooltipTop: number,
	tooltipW: number,
): React.CSSProperties {
	const size = 8;

	switch (placement) {
		case "bottom":
			return {
				position: "absolute",
				top: -size,
				left: Math.min(
					Math.max(
						spotRect.left +
							spotRect.width / 2 -
							tooltipLeft -
							size,
						16,
					),
					tooltipW - 32,
				),
				width: 0,
				height: 0,
				borderLeft: `${size}px solid transparent`,
				borderRight: `${size}px solid transparent`,
				borderBottom: `${size}px solid var(--color-fd-card)`,
			};
		case "top":
			return {
				position: "absolute",
				bottom: -size,
				left: Math.min(
					Math.max(
						spotRect.left +
							spotRect.width / 2 -
							tooltipLeft -
							size,
						16,
					),
					tooltipW - 32,
				),
				width: 0,
				height: 0,
				borderLeft: `${size}px solid transparent`,
				borderRight: `${size}px solid transparent`,
				borderTop: `${size}px solid var(--color-fd-card)`,
			};
		case "right":
			return {
				position: "absolute",
				left: -size,
				top:
					spotRect.top +
					spotRect.height / 2 -
					tooltipTop -
					size,
				width: 0,
				height: 0,
				borderTop: `${size}px solid transparent`,
				borderBottom: `${size}px solid transparent`,
				borderRight: `${size}px solid var(--color-fd-card)`,
			};
		case "left":
			return {
				position: "absolute",
				right: -size,
				top:
					spotRect.top +
					spotRect.height / 2 -
					tooltipTop -
					size,
				width: 0,
				height: 0,
				borderTop: `${size}px solid transparent`,
				borderBottom: `${size}px solid transparent`,
				borderLeft: `${size}px solid var(--color-fd-card)`,
			};
	}
}

export function TourOverlay() {
	const { isActive, currentStep, isTransitioning, endTour, goToStep, totalSteps } =
		useTour();

	const [spotRect, setSpotRect] = useState<Rect>(EMPTY_RECT);
	const [tooltipPos, setTooltipPos] = useState<{
		top: number;
		left: number;
		placement: Placement;
	}>({ top: 0, left: 0, placement: "bottom" });
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const [mounted, setMounted] = useState(false);

	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Update spotlight rect whenever step changes or on resize/scroll
	const updateRect = useCallback(() => {
		if (!isActive) return;
		const step = tourSteps[currentStep];
		if (!step) return;

		const rect = getTargetRect(step.target, step.padding);
		if (rect) {
			setSpotRect(rect);
		} else if (!step.target) {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			setSpotRect({
				top: vh / 2 - 1,
				left: vw / 2 - 1,
				width: 2,
				height: 2,
			});
		}
	}, [isActive, currentStep]);

	useEffect(() => {
		updateRect();
		window.addEventListener("resize", updateRect);
		window.addEventListener("scroll", updateRect, true);

		let observer: ResizeObserver | undefined;
		const step = tourSteps[currentStep];
		if (step?.target) {
			const el = document.querySelector(
				`[data-tour="${step.target}"]`,
			);
			if (el) {
				observer = new ResizeObserver(updateRect);
				observer.observe(el);
			}
		}

		return () => {
			window.removeEventListener("resize", updateRect);
			window.removeEventListener("scroll", updateRect, true);
			observer?.disconnect();
		};
	}, [updateRect, currentStep]);

	// Position tooltip after spotlight settles
	useEffect(() => {
		if (!isActive) return;

		setTooltipVisible(false);

		const timer = setTimeout(() => {
			const step = tourSteps[currentStep];
			if (!step) return;

			const tooltip = tooltipRef.current;
			if (!tooltip) return;

			const tooltipW = tooltip.offsetWidth;
			const tooltipH = tooltip.offsetHeight;

			if (!step.target) {
				const vw = window.innerWidth;
				const vh = window.innerHeight;
				setTooltipPos({
					top: vh / 2 - tooltipH / 2,
					left: Math.max(12, (vw - tooltipW) / 2),
					placement: "bottom",
				});
			} else {
				const rect = getTargetRect(step.target, step.padding);
				if (rect) {
					const { top, left, actual } = computePlacement(
						rect,
						tooltipW,
						tooltipH,
						step.placement,
					);
					setTooltipPos({ top, left, placement: actual });
				}
			}

			setTooltipVisible(true);
		}, 250);

		return () => clearTimeout(timer);
	}, [isActive, currentStep, spotRect]);

	if (!mounted || !isActive) return null;

	const step = tourSteps[currentStep];
	const isWelcome = !step?.target;
	const isLastStep = currentStep === totalSteps - 1;

	const overlay = (
		<div
			className="fixed inset-0 z-[9998]"
			aria-modal="true"
			role="dialog"
		>
			{/* Click-to-close backdrop */}
			<button
				type="button"
				className="fixed inset-0 z-[9998] cursor-default bg-transparent"
				onClick={endTour}
				aria-label="Close tour"
				tabIndex={-1}
			/>

			{/* Spotlight cutout */}
			<div
				className="fixed z-[9999] pointer-events-none tour-pulse-ring"
				style={{
					top: spotRect.top,
					left: spotRect.left,
					width: spotRect.width,
					height: spotRect.height,
					borderRadius: step?.borderRadius ?? 12,
					boxShadow: isWelcome
						? "0 0 0 9999px rgba(0,0,0,0.75)"
						: "0 0 0 9999px rgba(0,0,0,0.65)",
					transition:
						"top 0.4s cubic-bezier(0.16, 1, 0.3, 1), left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			/>

			{/* Tooltip */}
			<div
				ref={tooltipRef}
				className={`fixed z-[10000] w-[340px] max-w-[calc(100vw-24px)] rounded-xl border border-fd-border bg-fd-card shadow-2xl shadow-black/20 ${
					tooltipVisible && !isTransitioning
						? "tour-tooltip-enter opacity-100"
						: "opacity-0"
				}`}
				style={{
					top: tooltipPos.top,
					left: tooltipPos.left,
					transition: tooltipVisible
						? "opacity 0.2s ease-out"
						: "opacity 0.15s ease-out",
					pointerEvents: "auto",
				}}
			>
				{/* Caret arrow */}
				{!isWelcome && tooltipVisible && (
					<div
						style={getCaretStyle(
							tooltipPos.placement,
							spotRect,
							tooltipPos.left,
							tooltipPos.top,
							340,
						)}
					/>
				)}

				{/* Progress bar */}
				<div className="flex gap-1 px-5 pt-4">
					{Array.from({ length: totalSteps }).map((_, i) => (
						<div
							key={i}
							className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
								i <= currentStep
									? "bg-red-500"
									: "bg-fd-muted-foreground/20"
							}`}
						/>
					))}
				</div>

				{/* Content */}
				<div className="px-5 pt-4 pb-2">
					<p className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-red-500 font-semibold">
						{currentStep + 1} / {totalSteps}
					</p>
					<h3 className="mt-2 font-[family-name:var(--font-sora)] text-lg font-bold text-fd-foreground">
						{step?.title}
					</h3>
					<p className="mt-2 text-[14px] leading-relaxed text-fd-muted-foreground">
						{step?.description}
					</p>
				</div>

				{/* Navigation */}
				<div className="flex items-center justify-between border-t border-fd-border/50 px-5 py-3">
					<button
						type="button"
						onClick={endTour}
						className="text-[12px] font-[family-name:var(--font-mono)] text-fd-muted-foreground hover:text-fd-foreground transition-colors"
					>
						Skip
					</button>
					<div className="flex items-center gap-2">
						{currentStep > 0 && (
							<button
								type="button"
								onClick={() => goToStep(currentStep - 1)}
								className="rounded-lg border border-fd-border px-4 py-1.5 text-[13px] font-semibold text-fd-foreground transition-all duration-200 hover:bg-fd-muted"
							>
								Back
							</button>
						)}
						<button
							type="button"
							onClick={() => {
								if (isLastStep) {
									endTour();
								} else {
									goToStep(currentStep + 1);
								}
							}}
							className="rounded-lg bg-red-500 px-4 py-1.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-[0_0_16px_rgba(239,68,68,0.25)]"
						>
							{isLastStep
								? "Finish"
								: isWelcome
									? "Start Tour"
									: "Next"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(overlay, document.body);
}
