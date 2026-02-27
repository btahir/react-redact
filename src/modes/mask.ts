/**
 * Replace text with bullets matching visual length using ch units.
 */
export function maskValue(text: string): string {
	return "•".repeat(text.length);
}

export function getMaskStyle(text: string): { width: string; display: string } {
	return {
		width: `${text.length}ch`,
		display: "inline-block",
	};
}
