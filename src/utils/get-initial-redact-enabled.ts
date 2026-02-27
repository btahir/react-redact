/**
 * Read initial redact state from URL query (?redact=true).
 * Use for permanent demo environments or when you want the page to load already redacted.
 * For env-based initial state (e.g. NEXT_PUBLIC_REDACT), pass it from your app:
 * `enabled={typeof window !== 'undefined' ? getInitialRedactEnabled() : process.env.NEXT_PUBLIC_REDACT === 'true'}`.
 *
 * @example
 * <RedactProvider enabled={getInitialRedactEnabled()}>
 */
export function getInitialRedactEnabled(): boolean {
	if (typeof window === "undefined") return false;
	const params = new URLSearchParams(window.location.search);
	return params.get("redact") === "true" || params.get("redact") === "1";
}
