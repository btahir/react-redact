import type React from "react";
import { colors } from "../lib/brand";
import { fontFamily } from "../lib/fonts";
import { WindowChrome } from "./WindowChrome";

interface CodeLine {
  code: string;
  type: "import" | "keyword" | "jsx" | "default" | "blank";
}

function getLineColor(type: CodeLine["type"]): string {
  switch (type) {
    case "import":
      return colors.red400;
    case "keyword":
      return colors.text;
    case "jsx":
      return "rgba(250,250,250,0.8)";
    default:
      return colors.textMuted;
  }
}

export const CodeBlock: React.FC<{
  lines: CodeLine[];
  title?: string;
  width?: number;
}> = ({ lines, title = "App.tsx", width }) => {
  return (
    <WindowChrome title={title} width={width}>
      <div style={{ padding: "16px 20px", overflow: "hidden" }}>
        {lines.map((line, i) => (
          <div
            key={`${i}-${line.type}`}
            style={{
              display: "flex",
              fontFamily: fontFamily.mono,
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <span
              style={{
                width: 32,
                flexShrink: 0,
                textAlign: "right",
                color: `${colors.textMuted}60`,
                userSelect: "none",
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                marginLeft: 16,
                color: getLineColor(line.type),
                fontWeight: line.type === "keyword" ? 600 : 400,
                whiteSpace: "pre",
              }}
            >
              {line.code || "\u00A0"}
            </span>
          </div>
        ))}
      </div>
    </WindowChrome>
  );
};
