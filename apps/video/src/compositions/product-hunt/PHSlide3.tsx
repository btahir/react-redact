import { AbsoluteFill } from "remotion";
import { CodeBlock } from "../../components/CodeBlock";
import { DotGrid } from "../../components/DotGrid";
import { GrainOverlay } from "../../components/GrainOverlay";
import { colors } from "../../lib/brand";
import { fontFamily } from "../../lib/fonts";
import { codeLines } from "../../lib/sample-data";

/** Code Snippet — quick start */
export const PHSlide3: React.FC = () => {
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
        Running in 10 Lines
      </h2>
      <p
        style={{
          zIndex: 10,
          fontFamily: fontFamily.sora,
          fontSize: 16,
          color: colors.textMuted,
          margin: "0 0 32px 0",
        }}
      >
        Wrap your app, mark sensitive fields, toggle with a shortcut.
      </p>

      <div style={{ zIndex: 10, width: "100%", maxWidth: 600 }}>
        <CodeBlock lines={codeLines} />
      </div>
    </AbsoluteFill>
  );
};
