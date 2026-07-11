// 13-19 digits, optional single space/dash between each digit. We validate with Luhn to
// reduce false positives. Bounded to a fixed repetition count (one optional separator per
// digit) rather than a nested `(?:\d[\d\s-]*){13,19}` quantifier, which is catastrophically
// backtracking on long non-matching digit runs (ReDoS).
const CARD_REGEX = /\b\d(?:[ -]?\d){12,18}\b/g;

function luhnCheck(digits: string): boolean {
	const s = digits.replace(/\D/g, "");
	if (s.length < 13 || s.length > 19) return false;
	let sum = 0;
	let alternate = false;
	for (let i = s.length - 1; i >= 0; i--) {
		let n = Number.parseInt(s[i], 10);
		if (alternate) {
			n *= 2;
			if (n > 9) n -= 9;
		}
		sum += n;
		alternate = !alternate;
	}
	return sum % 10 === 0;
}

/**
 * Match 13-19 digit sequences that pass Luhn. Returns global regex that we use
 * with exec in a loop and filter by Luhn.
 */
export const creditCardRegex: RegExp = CARD_REGEX;
export const creditCardName: "credit-card" = "credit-card" as const;

export function isLuhnValid(card: string): boolean {
	return luhnCheck(card);
}
