import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";
import { DashboardMockup } from "../components/DashboardMockup";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { KeystrokeOverlay } from "../components/KeystrokeOverlay";
import type { RedactMode } from "../components/RedactEffect";
import { colors } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

interface DemoCycle {
  mode: RedactMode;
  label: string;
  caption: string;
  startFrame: number;
  endFrame: number;
}

// Each cycle: 130 frames (~4.3s)
const CYCLE = 130;
const cycles: DemoCycle[] = [
  { mode: "blur", label: "Blur Mode", caption: "CSS blur hides text while preserving layout", startFrame: 0, endFrame: CYCLE },
  { mode: "mask", label: "Mask Mode", caption: "Replace characters with bullets", startFrame: CYCLE, endFrame: CYCLE * 2 },
  { mode: "replace", label: "Replace Mode", caption: "Swap real data with deterministic fakes", startFrame: CYCLE * 2, endFrame: CYCLE * 3 },
];

export const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 390 frames @ 30fps = 13s total, 3 cycles of 130 frames
  // Per cycle (130 frames):
  //   0-10:   Visible, mode label snaps in
  //   10-20:  Keystroke overlay
  //   20-55:  Redact animation (spring)
  //   55-85:  Hold redacted
  //   85-110: Reverse
  //   110-130: Hold visible, transition out

  const currentCycle = cycles.find(
    (c) => frame >= c.startFrame && frame < c.endFrame
  ) ?? cycles[2];

  const cycleFrame = frame - currentCycle.startFrame;

  let progress: number;
  if (cycleFrame < 10) {
    progress = 0;
  } else if (cycleFrame < 55) {
    progress = spring({
      frame: cycleFrame - 20,
      fps,
      config: { damping: 12, mass: 0.6, stiffness: 250 },
    });
    progress = Math.max(0, progress);
  } else if (cycleFrame < 85) {
    progress = 1;
  } else if (cycleFrame < 110) {
    const reverseProgress = spring({
      frame: cycleFrame - 85,
      fps,
      config: { damping: 12, mass: 0.6, stiffness: 250 },
    });
    progress = 1 - reverseProgress;
  } else {
    progress = 0;
  }

  const labelOpacity = interpolate(cycleFrame, [0, 6, 120, 130], [0, 1, 1, 0], {
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
        padding: 60,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      <div
        style={{
          zIndex: 10,
          fontFamily: fontFamily.mono,
          fontSize: 14,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: colors.primary,
          marginBottom: 20,
          opacity: labelOpacity,
        }}
      >
        {currentCycle.label}
      </div>

      <div style={{ zIndex: 10, width: "100%", maxWidth: 700 }}>
        <DashboardMockup mode={currentCycle.mode} progress={progress} />
      </div>

      <KeystrokeOverlay startFrame={currentCycle.startFrame + 10} />

      <Caption
        text={currentCycle.caption}
        startFrame={currentCycle.startFrame + 25}
        endFrame={currentCycle.startFrame + 105}
      />
    </AbsoluteFill>
  );
};
