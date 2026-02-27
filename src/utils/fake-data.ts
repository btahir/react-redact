/**
 * Simple non-crypto hash for deterministic seeding.
 * Used so the same PII value always gets the same fake replacement.
 */
function hashString(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		const c = s.charCodeAt(i);
		h = (h << 5) - h + c;
		h = h & h;
	}
	return Math.abs(h);
}

function seeded(seed: number, min: number, max: number): number {
	const x = Math.sin(seed * 9999) * 10000;
	return min + (Math.floor((x - Math.floor(x)) * (max - min + 1)) % (max - min + 1));
}

function pick<T>(seed: number, arr: T[]): T {
	return arr[seeded(seed, 0, arr.length - 1)];
}

const FIRST = ["Jane", "John", "Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Henry"];
const LAST = [
	"Smith",
	"Doe",
	"Demo",
	"Example",
	"Sample",
	"Test",
	"User",
	"Demo",
	"Public",
	"Anon",
];
const DOMAINS = ["example.com", "demo.com", "test.com", "sample.org", "placeholder.dev"];

export function fakeEmail(original: string): string {
	const seed = hashString(original);
	const local = `${pick(seed, FIRST).toLowerCase()}.${pick(seed + 1, LAST).toLowerCase()}`;
	const domain = pick(seed + 2, DOMAINS);
	return `${local}@${domain}`;
}

export function fakePhone(original: string): string {
	const seed = hashString(original);
	const a = seeded(seed, 200, 999);
	const b = seeded(seed + 1, 200, 999);
	const c = seeded(seed + 2, 1000, 9999);
	return `(${a}) ${b}-${c}`;
}

export function fakeName(original: string): string {
	const seed = hashString(original);
	return `${pick(seed, FIRST)} ${pick(seed + 1, LAST)}`;
}

export function fakeIp(original: string): string {
	const seed = hashString(original);
	if (original.includes(":")) {
		return "2001:db8::1";
	}
	const a = seeded(seed, 10, 223);
	const b = seeded(seed + 1, 0, 255);
	const c = seeded(seed + 2, 0, 255);
	const d = seeded(seed + 3, 1, 254);
	return `${a}.${b}.${c}.${d}`;
}

export function fakeSsn(original: string): string {
	const seed = hashString(original);
	const a = seeded(seed, 100, 899);
	const b = seeded(seed + 1, 10, 99);
	const c = seeded(seed + 2, 1000, 9999);
	return `${a}-${b}-${c}`;
}

/**
 * Pick a fake generator by hint (e.g. from pattern type) or guess from format.
 */
export function fakeFor(value: string, hint?: string): string {
	const v = value.trim();
	if (hint === "email" || v.includes("@")) return fakeEmail(v);
	if (hint === "phone" || (/^[\d\s\-+()]+$/.test(v) && v.length >= 10)) return fakePhone(v);
	if (hint === "ssn" || /^\d{3}-\d{2}-\d{4}$/.test(v)) return fakeSsn(v);
	if (hint === "ip" || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v) || v.includes(":"))
		return fakeIp(v);
	if (hint === "credit-card") return "•••• •••• •••• ••••";
	// Default: mask with bullets
	return "•".repeat(Math.min(v.length, 20));
}
