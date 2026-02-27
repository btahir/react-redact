import { fakeFor } from "../utils/fake-data.js";

export type ReplaceHint = "email" | "phone" | "ssn" | "credit-card" | "ip" | undefined;

/**
 * Return deterministic fake replacement for PII.
 */
export function replaceValue(value: string, hint?: ReplaceHint): string {
	return fakeFor(value, hint);
}
