import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, SPRING_SNAPPY } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

const keys = ["⌘", "⇧", "X"];

export const KeystrokeOverlay: React.FC<{
  startFrame?: number;
}> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = frame - startFrame;

  if (relFrame < 0) return null;

  const containerOpacity = interpolate(relFrame, [0, 3, 25, 30], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 190,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        opacity: containerOpacity,
        zIndex: 40,
      }}
    >
      {keys.map((key, i) => {
        const keyProgress = spring({
          frame: relFrame - i * 3,
          fps,
          config: SPRING_SNAPPY,
        });

        const scale = interpolate(keyProgress, [0, 1], [0.5, 1]);
        const opacity = interpolate(keyProgress, [0, 1], [0, 1]);

        return (
          <div
            key={key}
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 18,
              fontWeight: 600,
              color: colors.text,
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 8,
              padding: "8px 14px",
              transform: `scale(${scale})`,
              opacity,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {key}
          </div>
        );
      })}
    </div>
  );
};
