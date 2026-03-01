// 13-19 digits, optional spaces/dashes. We validate with Luhn to reduce false positives.
const CARD_REGEX = /\b(?:\d[\d\s-]*){13,19}\b/g;

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
