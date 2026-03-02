import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandTitle } from "../components/BrandTitle";
import { DashboardMockup } from "../components/DashboardMockup";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { colors } from "../lib/brand";

export const SocialGif: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 75 frames @ 15fps = 5s — SNAPPY
  // 0-10: Title fade in
  // 8-16: Dashboard appears
  // 18-32: Blur redaction
  // 32-48: Hold
  // 48-60: Reverse
  // 60-75: Hold for loop

  const dashboardOpacity = interpolate(frame, [8, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashboardScale = interpolate(frame, [8, 14], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let progress: number;
  if (frame < 18) {
    progress = 0;
  } else if (frame < 32) {
    progress = spring({
      frame: frame - 18,
      fps,
      config: { damping: 12, mass: 0.6, stiffness: 250 },
    });
  } else if (frame < 48) {
    progress = 1;
  } else if (frame < 60) {
    progress = 1 - spring({
      frame: frame - 48,
      fps,
      config: { damping: 12, mass: 0.6, stiffness: 250 },
    });
  } else {
    progress = 0;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 40,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      <div style={{ zIndex: 10 }}>
        <BrandTitle fontSize={42} />
      </div>

      <div
        style={{
          zIndex: 10,
          opacity: dashboardOpacity,
          transform: `scale(${dashboardScale})`,
          width: "100%",
          maxWidth: 560,
        }}
      >
        <DashboardMockup mode="blur" progress={progress} width={560} showBadge={false} />
      </div>
    </AbsoluteFill>
  );
};
