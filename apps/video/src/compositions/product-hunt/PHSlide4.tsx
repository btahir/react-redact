import { AbsoluteFill } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { GrainOverlay } from "../../components/GrainOverlay";
import { colors } from "../../lib/brand";
import { fontFamily } from "../../lib/fonts";

const patterns = [
  { name: "email", example: "sarah.j@acme.corp", regex: "RFC 5322" },
  { name: "phone", example: "(415) 555-0198", regex: "US/intl formats" },
  { name: "ssn", example: "423-91-8847", regex: "XXX-XX-XXXX" },
  { name: "credit-card", example: "4532 8901 2345 6789", regex: "Luhn-validated" },
  { name: "ip", example: "192.168.1.42", regex: "IPv4" },
];

/** Auto-Detect — pattern badges with examples */
export const PHSlide4: React.FC = () => {
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
        Auto-Detect PII
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
        5 built-in patterns scan DOM text nodes automatically.
      </p>

      {/* Pattern cards */}
      <div
        style={{
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 600,
        }}
      >
        {patterns.map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderRadius: 10,
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  width: 100,
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 14,
                  color: colors.text,
                }}
              >
                {p.example}
              </span>
            </div>
            <span
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 11,
                color: colors.textDim,
              }}
            >
              {p.regex}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
