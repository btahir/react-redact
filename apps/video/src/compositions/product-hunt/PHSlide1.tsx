import { AbsoluteFill } from "remotion";
import { DashboardMockup } from "../../components/DashboardMockup";
import { DotGrid } from "../../components/DotGrid";
import { GrainOverlay } from "../../components/GrainOverlay";
import { colors } from "../../lib/brand";
import { fontFamily } from "../../lib/fonts";

/** Before / After — split view */
export const PHSlide1: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 40,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      {/* Logo + label */}
      <div
        style={{
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          alignSelf: "flex-start",
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.sora,
            fontSize: 18,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          react-redact
        </span>
        <div
          style={{
            width: 40,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.primary,
          }}
        />
      </div>

      {/* Title */}
      <h2
        style={{
          zIndex: 10,
          fontFamily: fontFamily.sora,
          fontSize: 32,
          fontWeight: 700,
          color: colors.text,
          margin: "0 0 32px 0",
        }}
      >
        Before & After
      </h2>

      {/* Split view */}
      <div
        style={{
          zIndex: 10,
          display: "flex",
          gap: 24,
          width: "100%",
          flex: 1,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: colors.success,
            }}
          >
            Live Data
          </span>
          <DashboardMockup mode="blur" progress={0} showBadge={false} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: colors.primary,
            }}
          >
            Redacted
          </span>
          <DashboardMockup mode="blur" progress={1} showBadge={false} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
