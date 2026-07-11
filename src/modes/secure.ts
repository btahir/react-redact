import { fakeFor } from "../utils/fake-data.js";
import { DEFAULT_MASK_CHAR, maskValue } from "./mask.js";

/**
 * Compute the display text for mode="secure" spans created by `<RedactAuto>`, which always
 * carry an optional pattern `hint` from the scanner.
 *
 * - With a `hint` (react-redact's built-in patterns — email/phone/ssn/credit-card/ip), mirrors
 *   mode="replace": deterministic fake data via `fakeFor`.
 * - Without one — a `customPatterns` match, which the scanner never attaches a hint to — falls
 *   back to the configurable mask character (sized to the real text's length) instead of
 *   `fakeFor`'s generic capped-bullet default, so unrecognized patterns still redact
 *   consistently with mode="mask".
 *
 * In both branches the real `text` is only ever read to compute a same-shape replacement —
 * it is never written back to the DOM (no `data-redact-original`); callers are responsible for
 * stashing `text` in a JS-side map if they need to restore it later.
 */
export function secureValue(
	text: string,
	hint?: string,
	maskChar: string = DEFAULT_MASK_CHAR,
): string {
	if (hint) return fakeFor(text, hint);
	return maskValue(text, maskChar);
}
