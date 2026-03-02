import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, SPRING_SNAPPY } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

export const BrandTitle: React.FC<{
  startFrame?: number;
  fontSize?: number;
}> = ({ startFrame = 0, fontSize = 72 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = frame - startFrame;

  const titleOpacity = interpolate(relFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const titleY = interpolate(relFrame, [0, 10], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const barScaleX = spring({
    frame: Math.max(0, relFrame - 8),
    fps,
    config: SPRING_SNAPPY,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}
    >
      <h1
        style={{
          fontFamily: fontFamily.sora,
          fontSize,
          fontWeight: 800,
          color: colors.text,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          margin: 0,
        }}
      >
        react-redact
      </h1>
      <div
        style={{
          width: fontSize * 2.5,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.primary,
          transform: `scaleX(${barScaleX})`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
};
