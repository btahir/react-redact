import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DashboardMockup } from "../components/DashboardMockup";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { KeystrokeOverlay } from "../components/KeystrokeOverlay";
import { colors } from "../lib/brand";

export const HeroGif: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 90 frames @ 15fps = 6s — TIGHTER LOOP
  // 0-8:   Dashboard visible
  // 8-16:  Keystroke overlay appears
  // 16-35: Blur sweeps across rows (spring)
  // 35-50: Hold blurred, "REDACTED" glows
  // 50-58: Keystroke again
  // 58-75: Blur reverses
  // 75-90: Hold visible for seamless loop

  let progress: number;

  if (frame < 8) {
    progress = 0;
  } else if (frame < 16) {
    progress = 0;
  } else if (frame < 35) {
    progress = spring({
      frame: frame - 16,
      fps,
      config: { damping: 12, mass: 0.6, stiffness: 250 },
    });
  } else if (frame < 50) {
    progress = 1;
  } else if (frame < 58) {
    progress = 1;
  } else if (frame < 75) {
    const rev = spring({
      frame: frame - 58,
      fps,
      config: { damping: 12, mass: 0.6, stiffness: 250 },
    });
    progress = 1 - rev;
  } else {
    progress = 0;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 700 }}>
        <DashboardMockup mode="blur" progress={progress} />
      </div>

      <KeystrokeOverlay startFrame={8} />
      {frame >= 50 && frame < 70 && <KeystrokeOverlay startFrame={50} />}
    </AbsoluteFill>
  );
};
