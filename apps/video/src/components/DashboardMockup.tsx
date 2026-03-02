import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, SPRING_SNAPPY } from "../lib/brand";
import { fontFamily } from "../lib/fonts";
import { piiRows } from "../lib/sample-data";
import type { RedactMode } from "./RedactEffect";
import { RedactEffect } from "./RedactEffect";
import { WindowChrome } from "./WindowChrome";

const ROW_STAGGER_FRAMES = 3;

export const DashboardMockup: React.FC<{
  mode: RedactMode;
  progress: number;
  width?: number;
  showBadge?: boolean;
}> = ({ mode, progress, width, showBadge = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeIsRedacted = progress > 0.5;

  return (
    <WindowChrome
      title="dashboard.tsx"
      width={width}
      rightSlot={
        showBadge ? (
          <div
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.1em",
              padding: "6px 16px",
              borderRadius: 8,
              color: "#fff",
              backgroundColor: badgeIsRedacted ? colors.primary : colors.textDim,
              boxShadow: badgeIsRedacted
                ? `0 0 16px ${colors.glow}`
                : "none",
              transition: "none",
            }}
          >
            {badgeIsRedacted ? "REDACTED" : "LIVE DATA"}
          </div>
        ) : undefined
      }
    >
      {/* Mode bar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          borderBottom: `1px solid ${colors.cardBorder}`,
          backgroundColor: "rgba(20,20,20,0.5)",
          padding: "8px 20px",
        }}
      >
        {(["blur", "mask", "replace"] as const).map((m) => (
          <div
            key={m}
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              padding: "4px 14px",
              borderRadius: 6,
              color: mode === m ? colors.bg : colors.textMuted,
              backgroundColor: mode === m ? colors.text : "transparent",
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Data rows */}
      <div>
        {piiRows.map((row, i) => {
          const rowProgress = Math.max(
            0,
            Math.min(1, progress * (1 + (piiRows.length - 1) * 0.15) - i * 0.15)
          );

          return (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom:
                  i < piiRows.length - 1
                    ? `1px solid ${colors.cardBorder}80`
                    : "none",
              }}
            >
              <span
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: colors.textMuted,
                  width: 60,
                  flexShrink: 0,
                }}
              >
                {row.label}
              </span>
              <RedactEffect
                value={row.value}
                masked={row.masked}
                replaced={row.replaced}
                mode={mode}
                progress={rowProgress}
              />
            </div>
          );
        })}
      </div>
    </WindowChrome>
  );
};
