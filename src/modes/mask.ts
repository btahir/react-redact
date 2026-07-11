/** Default mask character used when no override is configured. */
export const DEFAULT_MASK_CHAR = "•";

/**
 * Replace text with a repeated mask character matching visual length using ch units.
 */
export function maskValue(text: string, char: string = DEFAULT_MASK_CHAR): string {
	const c = char || DEFAULT_MASK_CHAR;
	return c.repeat(text.length);
}

export function getMaskStyle(text: string): { width: string; display: string } {
	return {
		width: `${text.length}ch`,
		display: "inline-block",
	};
}
