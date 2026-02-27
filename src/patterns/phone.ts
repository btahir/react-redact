// US/intl: (555) 555-0123, +1-555-555-0123, 555-555-0123, 5555550123 with optional spaces/dashes
export const phoneRegex =
	/(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g;
export const phoneName = "phone" as const;
