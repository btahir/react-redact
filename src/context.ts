import { createContext } from "react";

export type RedactMode = "blur" | "mask" | "replace" | "custom";

export interface RedactContextValue {
	enabled: boolean;
	mode: RedactMode;
	setEnabled: (enabled: boolean) => void;
}

export const RedactContext = createContext<RedactContextValue | null>(null);
