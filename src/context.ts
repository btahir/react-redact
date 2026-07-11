import { type Context, createContext } from "react";
import type { BuiltInPatternName } from "./patterns/index.js";

export type RedactMode = "blur" | "mask" | "replace" | "secure" | "custom";

/** Props passed to a custom redaction render function. */
export interface CustomRedactRenderProps {
	children: React.ReactNode;
	text: string;
}

/** User-provided render function for mode="custom". Must return a wrapper with data-redact. */
export type CustomRedactRender = (props: CustomRedactRenderProps) => React.ReactNode;

export interface RedactContextValue {
	enabled: boolean;
	mode: RedactMode;
	setEnabled: (value: boolean | ((prev: boolean) => boolean)) => void;
	autoDetect?: false | BuiltInPatternName[];
	customPatterns?: RegExp[];
	/** Default custom renderer when <Redact mode="custom"> doesn't provide renderRedacted. */
	customRender?: CustomRedactRender;
	/** Default blur radius (px) for mode="blur"; overridable per <Redact>/<RedactAuto>. */
	blurRadius: number;
	/** Default mask character for mode="mask"; overridable per <Redact>/<RedactAuto>. */
	maskChar: string;
	/** Whether a same-tab getDisplayMedia() capture is currently active (see autoRedactOnScreenShare). */
	isScreenSharing: boolean;
}

export const RedactContext: Context<RedactContextValue | null> =
	createContext<RedactContextValue | null>(null);
