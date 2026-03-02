import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { colors, SPRING_SNAPPY } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

const stats = [
  { label: "3.3 kB", desc: "gzipped" },
  { label: "0 deps", desc: "zero dependencies" },
  { label: "TypeScript", desc: "strict types" },
];

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 80 frames @ 30fps = 2.7s — PUNCHY
  // 0-8: Install command snaps in
  // 10-35: Stats pop in (staggered 4 frames)
  // 35-80: Hold

  const installOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const installY = interpolate(frame, [0, 8], [15, 0], {
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
        gap: 32,
        padding: 80,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      <div
        style={{
          zIndex: 10,
          opacity: installOpacity,
          transform: `translateY(${installY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 28,
            color: colors.textMuted,
            backgroundColor: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: "20px 40px",
          }}
        >
          <span style={{ color: colors.primary }}>$</span> npm install react-redact
        </div>
      </div>

      <div style={{ display: "flex", gap: 32, zIndex: 10 }}>
        {stats.map((stat, i) => {
          const statProgress = spring({
            frame: Math.max(0, frame - 12 - i * 4),
            fps,
            config: { ...SPRING_SNAPPY, stiffness: 280 },
          });

          return (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                opacity: interpolate(statProgress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(statProgress, [0, 1], [10, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: fontFamily.sora,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 12,
                  color: colors.textDim,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {stat.desc}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
