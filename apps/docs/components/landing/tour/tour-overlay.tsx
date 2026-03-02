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

const ZERO_RECT: Rect = { top: 0, left: 0, width: 0, height: 0 };

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

/**
 * Pick the best placement for the tooltip.
 * Tries placements WITHOUT clamping first — only the one that
 * genuinely fits (no overlap with spotlight, fully in viewport) wins.
 * Final position is then clamped as a safety net.
 */
function computePlacement(
	spot: Rect,
	tw: number,
	th: number,
	preferred: Placement,
): { top: number; left: number; actual: Placement } {
	const gap = 16;
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const isMobile = vw < 640;

	// Minimum assumed tooltip height — guards against measuring 0
	const safeH = Math.max(th, 180);

	const order: Placement[] = isMobile
		? ["bottom", "top"]
		: [preferred, "bottom", "top", "right", "left"];

	function raw(p: Placement): { top: number; left: number } {
		switch (p) {
			case "bottom":
				return {
					top: spot.top + spot.height + gap,
					left: spot.left + spot.width / 2 - tw / 2,
				};
			case "top":
				return {
					top: spot.top - safeH - gap,
					left: spot.left + spot.width / 2 - tw / 2,
				};
			case "right":
				return {
					top: spot.top + spot.height / 2 - safeH / 2,
					left: spot.left + spot.width + gap,
				};
			case "left":
				return {
					top: spot.top + spot.height / 2 - safeH / 2,
					left: spot.left - tw - gap,
				};
		}
	}

	// Try each placement — pick the first that fits without clamping
	for (const p of order) {
		const pos = raw(p);
		if (
			pos.top >= 8 &&
			pos.top + safeH <= vh - 8 &&
			pos.left >= 8 &&
			pos.left + tw <= vw - 8
		) {
			return {
				// Clamp left only (horizontal centering can still overshoot)
				top: pos.top,
				left: Math.max(12, Math.min(pos.left, vw - tw - 12)),
				actual: p,
			};
		}
	}

	// Nothing fits perfectly — use "bottom" or "top" whichever has more space,
	// then hard-clamp into viewport
	const spaceBelow = vh - (spot.top + spot.height + gap);
	const spaceAbove = spot.top - gap;
	const best = spaceBelow >= spaceAbove ? "bottom" : "top";
	const pos = raw(best);

	return {
		top: Math.max(12, Math.min(pos.top, vh - safeH - 12)),
		left: Math.max(12, Math.min(pos.left, vw - tw - 12)),
		actual: best,
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
	const clampX = (raw: number) =>
		Math.min(Math.max(raw, 16), tooltipW - 32);

	const centerX =
		spotRect.left + spotRect.width / 2 - tooltipLeft - size;
	const centerY =
		spotRect.top + spotRect.height / 2 - tooltipTop - size;

	switch (placement) {
		case "bottom":
			return {
				position: "absolute",
				top: -size,
				left: clampX(centerX),
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
				left: clampX(centerX),
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
				top: Math.max(16, centerY),
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
				top: Math.max(16, centerY),
				width: 0,
				height: 0,
				borderTop: `${size}px solid transparent`,
				borderBottom: `${size}px solid transparent`,
				borderLeft: `${size}px solid var(--color-fd-card)`,
			};
	}
}

export function TourOverlay() {
	const {
		isActive,
		currentStep,
		isTransitioning,
		endTour,
		goToStep,
		totalSteps,
	} = useTour();

	const [spotRect, setSpotRect] = useState<Rect>(ZERO_RECT);
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

	// Update spotlight rect on scroll/resize — instant tracking, no transitions
	const updateRect = useCallback(() => {
		if (!isActive) return;
		const step = tourSteps[currentStep];
		if (!step) return;

		if (!step.target) {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			setSpotRect({
				top: vh / 2 - 1,
				left: vw / 2 - 1,
				width: 2,
				height: 2,
			});
			return;
		}

		const rect = getTargetRect(step.target, step.padding);
		if (rect) {
			setSpotRect(rect);
		}
	}, [isActive, currentStep]);

	useEffect(() => {
		if (!isActive) return;

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
	}, [isActive, currentStep, updateRect]);

	// Position tooltip after scroll settles — uses rAF to guarantee layout is done
	useEffect(() => {
		if (!isActive || isTransitioning) {
			setTooltipVisible(false);
			return;
		}

		setTooltipVisible(false);

		// Wait a tick, then use rAF to ensure layout is committed before measuring
		const timer = setTimeout(() => {
			requestAnimationFrame(() => {
				const step = tourSteps[currentStep];
				if (!step) return;

				const tooltip = tooltipRef.current;
				if (!tooltip) return;

				const tooltipW = tooltip.offsetWidth;
				const tooltipH = tooltip.offsetHeight;

				if (!step.target) {
					const vw = window.innerWidth;
					const vh = window.innerHeight;
					const safeH = Math.max(tooltipH, 180);
					setTooltipPos({
						top: vh / 2 - safeH / 2,
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
			});
		}, 100);

		return () => clearTimeout(timer);
	}, [isActive, isTransitioning, currentStep, spotRect]);

	if (!mounted || !isActive) return null;

	const step = tourSteps[currentStep];
	const isWelcome = !step?.target;
	const isLastStep = currentStep === totalSteps - 1;
	const br = step?.borderRadius ?? 12;

	const overlay = (
		<div
			className="fixed inset-0 z-[9998]"
			aria-modal="true"
			role="dialog"
		>
			{/* Click-to-close backdrop */}
			<button
				type="button"
				className="fixed inset-0 z-[9998] cursor-default bg-transparent border-0"
				onClick={endTour}
				aria-label="Close tour"
				tabIndex={-1}
			/>

			{/* Spotlight: dark overlay with cutout hole */}
			<div
				className="fixed z-[9999] pointer-events-none"
				style={{
					top: spotRect.top,
					left: spotRect.left,
					width: spotRect.width,
					height: spotRect.height,
					borderRadius: br,
					boxShadow: isWelcome
						? "0 0 0 9999px rgba(0,0,0,0.75)"
						: "0 0 0 9999px rgba(0,0,0,0.65)",
				}}
			/>

			{/* Pulse ring */}
			{!isWelcome && !isTransitioning && (
				<div
					className="fixed z-[9999] pointer-events-none tour-ring"
					style={{
						top: spotRect.top - 3,
						left: spotRect.left - 3,
						width: spotRect.width + 6,
						height: spotRect.height + 6,
						borderRadius: br + 2,
					}}
				/>
			)}

			{/* Tooltip card */}
			<div
				ref={tooltipRef}
				className={`fixed z-[10000] w-[340px] max-w-[calc(100vw-24px)] rounded-xl border border-fd-border bg-fd-card shadow-2xl shadow-black/20 transition-opacity duration-200 ${
					tooltipVisible
						? "tour-tooltip-enter opacity-100"
						: "opacity-0 pointer-events-none"
				}`}
				style={{
					top: tooltipPos.top,
					left: tooltipPos.left,
					pointerEvents: tooltipVisible ? "auto" : "none",
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
