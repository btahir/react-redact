// RFC-ish email: local@domain (simplified, no exotic chars)
export const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
export const emailName = "email" as const;
