import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandTitle } from "../components/BrandTitle";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { colors, SPRING_SNAPPY } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

const modes = ["blur", "mask", "replace"];

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 75 frames @ 30fps = 2.5s — TIGHT
  // 0-12: BrandTitle snaps in
  // 10-22: Tagline slides up (overlapping)
  // 20-45: Mode badges spring in fast (staggered 4 frames apart)
  // 45-75: Brief hold

  const taglineOpacity = interpolate(frame, [10, 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const taglineY = interpolate(frame, [10, 20], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 80,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      <div style={{ zIndex: 10 }}>
        <BrandTitle fontSize={76} />
      </div>

      <p
        style={{
          fontFamily: fontFamily.sora,
          fontSize: 26,
          color: colors.textMuted,
          textAlign: "center",
          lineHeight: 1.4,
          margin: 0,
          zIndex: 10,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        One keyboard shortcut to make your entire app demo-safe.
      </p>

      <div style={{ display: "flex", gap: 16, zIndex: 10, marginTop: 4 }}>
        {modes.map((mode, i) => {
          const badgeProgress = spring({
            frame: Math.max(0, frame - 22 - i * 4),
            fps,
            config: { ...SPRING_SNAPPY, stiffness: 280 },
          });

          const scale = interpolate(badgeProgress, [0, 1], [0.4, 1]);
          const opacity = interpolate(badgeProgress, [0, 1], [0, 1]);

          return (
            <div
              key={mode}
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 16,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "12px 28px",
                borderRadius: 10,
                color: colors.text,
                backgroundColor: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                transform: `scale(${scale})`,
                opacity,
              }}
            >
              {mode}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
