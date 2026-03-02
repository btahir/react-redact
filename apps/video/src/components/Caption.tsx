import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../lib/fonts";

export const Caption: React.FC<{
  text: string;
  startFrame: number;
  endFrame: number;
}> = ({ text, startFrame, endFrame }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame || frame > endFrame) return null;

  const fadeIn = interpolate(frame, [startFrame, startFrame + 5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const fadeOut = interpolate(frame, [endFrame - 5, endFrame], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 45,
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <div
        style={{
          fontFamily: fontFamily.mono,
          fontSize: 16,
          color: "rgba(250,250,250,0.9)",
          backgroundColor: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          borderRadius: 8,
          padding: "10px 24px",
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};
