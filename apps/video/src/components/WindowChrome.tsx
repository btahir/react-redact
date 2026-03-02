import type React from "react";
import { colors } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

export const WindowChrome: React.FC<{
  title?: string;
  children: React.ReactNode;
  width?: number;
  rightSlot?: React.ReactNode;
}> = ({ title = "dashboard.tsx", children, width, rightSlot }) => {
  return (
    <div
      style={{
        width: width ?? "100%",
        borderRadius: 16,
        border: `1px solid ${colors.cardBorder}`,
        backgroundColor: colors.card,
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${colors.cardBorder}`,
          padding: "12px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#FF5F57",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#FEBC2E",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#28C840",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            {title}
          </span>
        </div>
        {rightSlot}
      </div>
      {/* Content */}
      {children}
    </div>
  );
};
