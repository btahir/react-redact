// RFC-ish email: local@domain (simplified, no exotic chars)
export const emailRegex: RegExp = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
export const emailName: "email" = "email" as const;
