import type { CSSProperties } from "react";

export const blurClassName = "react-redact-blur";

/** Default blur radius (px) used when no override is configured. */
export const DEFAULT_BLUR_RADIUS = 6;

export interface BlurProps {
	className: string;
	/** Inline styles so blur works even if styles.css isn't imported. */
	style: CSSProperties;
	"data-redact": string;
	"aria-hidden": string;
}

/**
 * Build props for a React-rendered blur span.
 * Applies filter/user-select as inline styles so blur is visually applied even
 * with zero CSS imported — styles.css remains available for user overrides
 * (e.g. via the "react-redact-blur" className) and the content-visibility helper class.
 */
export function getBlurProps(radius: number = DEFAULT_BLUR_RADIUS): BlurProps {
	return {
		className: blurClassName,
		style: {
			filter: `blur(${radius}px)`,
			userSelect: "none",
			WebkitUserSelect: "none",
		},
		"data-redact": "",
		"aria-hidden": "true",
	};
}

/**
 * Apply the same blur styling imperatively to a DOM element.
 * Used by RedactAuto, which builds spans outside of React's render path.
 */
export function applyBlurStyle(el: HTMLElement, radius: number = DEFAULT_BLUR_RADIUS): void {
	el.classList.add(blurClassName);
	el.style.filter = `blur(${radius}px)`;
	el.style.userSelect = "none";
	el.style.setProperty("-webkit-user-select", "none");
}
