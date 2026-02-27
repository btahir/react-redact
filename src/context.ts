import { createContext } from "react";
import type { BuiltInPatternName } from "./patterns/index.js";

export type RedactMode = "blur" | "mask" | "replace" | "custom";

export interface RedactContextValue {
	enabled: boolean;
	mode: RedactMode;
	setEnabled: (enabled: boolean) => void;
	autoDetect?: false | BuiltInPatternName[];
	customPatterns?: RegExp[];
}

export const RedactContext = createContext<RedactContextValue | null>(null);
