import { type Context, createContext } from "react";
import type { BuiltInPatternName } from "./patterns/index.js";

export type RedactMode = "blur" | "mask" | "replace" | "custom";

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
	setEnabled: (enabled: boolean) => void;
	autoDetect?: false | BuiltInPatternName[];
	customPatterns?: RegExp[];
	/** Default custom renderer when <Redact mode="custom"> doesn't provide renderRedacted. */
	customRender?: CustomRedactRender;
}

export const RedactContext: Context<RedactContextValue | null> =
	createContext<RedactContextValue | null>(null);
