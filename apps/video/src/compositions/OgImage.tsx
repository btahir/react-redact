import { AbsoluteFill } from "remotion";
import { DashboardMockup } from "../components/DashboardMockup";
import { DotGrid } from "../components/DotGrid";
import { GrainOverlay } from "../components/GrainOverlay";
import { colors } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

export const OgImage: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 60,
      }}
    >
      <DotGrid />
      <GrainOverlay />

      {/* Left 60% — text content */}
      <div
        style={{
          flex: "0 0 58%",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          zIndex: 10,
          paddingRight: 40,
        }}
      >
        <h1
          style={{
            fontFamily: fontFamily.sora,
            fontSize: 56,
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          react-redact
        </h1>
        <div
          style={{
            width: 140,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.primary,
          }}
        />
        <p
          style={{
            fontFamily: fontFamily.sora,
            fontSize: 22,
            color: colors.textMuted,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          One keyboard shortcut to make
          <br />
          your entire app demo-safe.
        </p>

        {/* Mode badges */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {["blur", "mask", "replace"].map((mode) => (
            <div
              key={mode}
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "8px 18px",
                borderRadius: 8,
                color: colors.text,
                backgroundColor: colors.card,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              {mode}
            </div>
          ))}
        </div>

        {/* Install command */}
        <div
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 15,
            color: colors.textMuted,
            marginTop: 8,
          }}
        >
          <span style={{ color: colors.primary }}>$</span> npm install react-redact
        </div>
      </div>

      {/* Right 40% — mini dashboard */}
      <div
        style={{
          flex: "0 0 42%",
          zIndex: 10,
          transform: "rotate(2deg) scale(0.85)",
          transformOrigin: "center",
          filter: "drop-shadow(0 0 40px rgba(239,68,68,0.15))",
        }}
      >
        <DashboardMockup mode="blur" progress={1} showBadge={false} />
      </div>

      {/* Red glow behind dashboard */}
      <div
        style={{
          position: "absolute",
          right: -60,
          top: "50%",
          transform: "translateY(-50%)",
          width: 500,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
          zIndex: 1,
        }}
      />
    </AbsoluteFill>
  );
};
