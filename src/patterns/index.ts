import { creditCardName, creditCardRegex, isLuhnValid } from "./credit-card.js";
import { emailName, emailRegex } from "./email.js";
import { ipName, ipRegex } from "./ip.js";
import { phoneName, phoneRegex } from "./phone.js";
import { ssnName, ssnRegex } from "./ssn.js";

export type BuiltInPatternName = "email" | "phone" | "ssn" | "credit-card" | "ip";

export interface PatternConfig {
	regex: RegExp;
	name: BuiltInPatternName | string;
}

const builtIns: Record<BuiltInPatternName, PatternConfig> = {
	email: { regex: new RegExp(emailRegex.source, "g"), name: emailName },
	phone: { regex: new RegExp(phoneRegex.source, "g"), name: phoneName },
	ssn: { regex: new RegExp(ssnRegex.source, "g"), name: ssnName },
	"credit-card": {
		regex: new RegExp(creditCardRegex.source, "g"),
		name: creditCardName,
	},
	ip: { regex: new RegExp(ipRegex.source, "g"), name: ipName },
};

export const patterns: Record<BuiltInPatternName, PatternConfig> = builtIns;

const VALID_NAMES = new Set<BuiltInPatternName>(Object.keys(builtIns) as BuiltInPatternName[]);

export function getPatterns(names: BuiltInPatternName[]): PatternConfig[] {
	return names
		.filter((n): n is BuiltInPatternName => VALID_NAMES.has(n))
		.map((n) => ({
			...builtIns[n],
			regex: new RegExp(builtIns[n].regex.source, "g"),
		}));
}

export function createPattern(regex: RegExp, name: string): PatternConfig {
	return { regex: new RegExp(regex.source, "g"), name };
}

/** Match credit-card only if Luhn passes. */
export function matchCreditCard(text: string): { match: string; index: number }[] {
	const r = new RegExp(creditCardRegex.source, "g");
	const out: { match: string; index: number }[] = [];
	let m = r.exec(text);
	while (m !== null) {
		const raw = m[0].replace(/\D/g, "");
		if (raw.length >= 13 && raw.length <= 19 && isLuhnValid(m[0])) {
			out.push({ match: m[0], index: m.index });
		}
		m = r.exec(text);
	}
	return out;
}

export { creditCardName, creditCardRegex, isLuhnValid } from "./credit-card.js";
export { emailName, emailRegex } from "./email.js";
export { ipName, ipRegex } from "./ip.js";
export { phoneName, phoneRegex } from "./phone.js";
export { ssnName, ssnRegex } from "./ssn.js";
