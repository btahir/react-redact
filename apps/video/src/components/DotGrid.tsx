import type React from "react";
import { colors } from "../lib/brand";

export const DotGrid: React.FC<{
  spacing?: number;
  dotSize?: number;
  opacity?: number;
}> = ({ spacing = 24, dotSize = 1, opacity = 0.15 }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity,
        backgroundImage: `radial-gradient(circle, ${colors.textMuted} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
    />
  );
};
