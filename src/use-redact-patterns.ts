import { useCallback, useContext } from "react";
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
 * Provider-level patterns are inherited by RedactAuto unless it supplies overrides.
 */
export function useRedactPatterns(): UseRedactPatternsReturn {
	const ctx = useContext(RedactContext);
	const patternNames = ctx?.autoDetect ?? [];
	const list = Array.isArray(patternNames) ? patternNames : [];
	const registerPattern = ctx?.registerPattern;
	const addPattern = useCallback(
		(regex: RegExp, name: string): PatternConfig => {
			const pattern = createPattern(regex, name);
			registerPattern?.(pattern.regex);
			return pattern;
		},
		[registerPattern],
	);
	return {
		patternNames: list,
		patterns: getPatterns(list),
		addPattern,
	};
}
