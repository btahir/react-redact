import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { colors } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // 145 frames @ 30fps = 4.8s
  // 0-15:   Line 1 fades in
  // 12-28:  Line 2 fades in
  // 28-145: Hold both lines

  const line1Opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const line2Opacity = interpolate(frame, [12, 28], [0, 1], {
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
        padding: 80,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      <div
        style={{
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <p
          style={{
            fontFamily: fontFamily.sora,
            fontSize: 44,
            fontWeight: 700,
            color: colors.text,
            opacity: line1Opacity,
            textAlign: "center",
            margin: 0,
          }}
        >
          You're about to share your screen.
        </p>
        <p
          style={{
            fontFamily: fontFamily.sora,
            fontSize: 44,
            fontWeight: 700,
            color: colors.textMuted,
            opacity: line2Opacity,
            textAlign: "center",
            margin: 0,
          }}
        >
          Your app is full of{" "}
          <span style={{ color: colors.primary }}>real customer data</span>.
        </p>
      </div>
    </AbsoluteFill>
  );
};
