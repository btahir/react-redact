import { useContext } from "react";
import { RedactContext } from "./context.js";
import {
	type BuiltInPatternName,
	createPattern,
	getPatterns,
	type PatternConfig,
} from "./patterns/index.js";

export interface UseRedactPatternsReturn {
	patternNames: BuiltInPatternName[];
	patterns: PatternConfig[];
	addPattern: (regex: RegExp, name: string) => PatternConfig;
}

/**
 * Hook to read active auto-detect pattern names and extend with custom patterns.
 * For now returns provider-level config; RedactAuto uses its own patterns prop.
 */
export function useRedactPatterns(): UseRedactPatternsReturn {
	const ctx = useContext(RedactContext);
	const patternNames = ctx?.autoDetect ?? [];
	const list = Array.isArray(patternNames) ? patternNames : [];
	return {
		patternNames: list,
		patterns: getPatterns(list),
		addPattern: (regex: RegExp, name: string) => createPattern(regex, name),
	};
}
