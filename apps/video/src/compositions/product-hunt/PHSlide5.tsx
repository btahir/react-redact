import { AbsoluteFill } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { GrainOverlay } from "../../components/GrainOverlay";
import { colors } from "../../lib/brand";
import { fontFamily } from "../../lib/fonts";

const stats = [
  { value: "3.3 kB", label: "gzipped bundle" },
  { value: "0", label: "dependencies" },
  { value: "5", label: "built-in patterns" },
  { value: "TypeScript", label: "strict types" },
  { value: "Next.js", label: "ready out of the box" },
];

/** Stats — key metrics */
export const PHSlide5: React.FC = () => {
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
          margin: "0 0 12px 0",
        }}
      >
        Built for Production
      </h2>
      <p
        style={{
          zIndex: 10,
          fontFamily: fontFamily.sora,
          fontSize: 16,
          color: colors.textMuted,
          margin: "0 0 48px 0",
        }}
      >
        Lightweight, type-safe, and framework-ready.
      </p>

      {/* Stats grid */}
      <div
        style={{
          zIndex: 10,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 32,
          width: "100%",
          maxWidth: 700,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "28px 24px",
              borderRadius: 12,
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              minWidth: 140,
            }}
          >
            <span
              style={{
                fontFamily: fontFamily.sora,
                fontSize: 28,
                fontWeight: 700,
                color: colors.text,
              }}
            >
              {s.value}
            </span>
            <span
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: colors.textDim,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
