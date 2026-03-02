export const colors = {
  primary: "#EF4444",
  primaryDark: "#DC2626",
  success: "#10B981",
  bg: "#0a0a0a",
  card: "#141414",
  cardBorder: "#262626",
  text: "#fafafa",
  textMuted: "#a3a3a3",
  textDim: "#525252",
  glow: "rgba(239,68,68,0.3)",
  red400: "#F87171",
} as const;

export const SPRING_SNAPPY = {
  damping: 15,
  mass: 0.8,
  stiffness: 200,
} as const;

export const SPRING_GENTLE = {
  damping: 20,
  mass: 1.2,
  stiffness: 120,
} as const;
