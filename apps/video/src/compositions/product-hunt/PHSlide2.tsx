import { AbsoluteFill } from "remotion";
import { DashboardMockup } from "../../components/DashboardMockup";
import { DotGrid } from "../../components/DotGrid";
import { GrainOverlay } from "../../components/GrainOverlay";
import { colors } from "../../lib/brand";
import { fontFamily } from "../../lib/fonts";

const modes = [
  { mode: "blur" as const, label: "Blur", desc: "CSS blur filter" },
  { mode: "mask" as const, label: "Mask", desc: "Bullet characters" },
  { mode: "replace" as const, label: "Replace", desc: "Fake data" },
];

/** Three Modes — 3 cards side by side */
export const PHSlide2: React.FC = () => {
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

      {/* Logo */}
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
        Three Redaction Modes
      </h2>

      <div
        style={{
          zIndex: 10,
          display: "flex",
          gap: 20,
          width: "100%",
          flex: 1,
        }}
      >
        {modes.map((m) => (
          <div
            key={m.mode}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: colors.primary,
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 11,
                  color: colors.textDim,
                }}
              >
                {m.desc}
              </span>
            </div>
            <DashboardMockup mode={m.mode} progress={1} showBadge={false} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
