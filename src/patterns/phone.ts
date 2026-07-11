// US/intl: (555) 555-0123, +1-555-555-0123, 555-555-0123, 5555550123 with optional spaces/dashes.
// Wrapped in (?<!\d) / (?!\d) so a match can't start or end mid-digit-run — otherwise the bare
// \d{3}[-.\s]?\d{3}[-.\s]?\d{4} alternative would grab any 10 consecutive digits out of a longer
// numeric string (e.g. an order/tracking number). \b guards the bare alternative against
// letter-adjacent digit runs (e.g. "ORDER1234567890").
export const phoneRegex: RegExp =
	/(?<!\d)(?:(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b)(?!\d)/g;
export const phoneName: "phone" = "phone" as const;
