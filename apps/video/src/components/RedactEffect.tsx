import type React from "react";
import { interpolate } from "remotion";
import { colors } from "../lib/brand";
import { fontFamily } from "../lib/fonts";

export type RedactMode = "blur" | "mask" | "replace";

export const RedactEffect: React.FC<{
  value: string;
  masked: string;
  replaced: string;
  mode: RedactMode;
  progress: number;
}> = ({ value, masked, replaced, mode, progress }) => {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  if (mode === "blur") {
    const blurAmount = interpolate(clampedProgress, [0, 1], [0, 8]);
    return (
      <span
        style={{
          fontFamily: fontFamily.mono,
          fontSize: 14,
          color: colors.text,
          filter: `blur(${blurAmount}px)`,
          transition: "none",
          userSelect: "none",
        }}
      >
        {value}
      </span>
    );
  }

  if (mode === "mask") {
    const showMask = clampedProgress > 0.5;
    const fadeIn = showMask
      ? interpolate(clampedProgress, [0.5, 0.7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
    const fadeOut = showMask
      ? 0
      : interpolate(clampedProgress, [0.3, 0.5], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

    return (
      <span style={{ position: "relative", fontFamily: fontFamily.mono, fontSize: 14 }}>
        <span
          style={{
            color: colors.text,
            opacity: showMask ? 0 : fadeOut,
          }}
        >
          {value}
        </span>
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            color: colors.text,
            opacity: showMask ? fadeIn : 0,
            letterSpacing: "-0.02em",
            userSelect: "none",
          }}
        >
          {masked}
        </span>
      </span>
    );
  }

  // replace mode
  const showReplaced = clampedProgress > 0.5;
  const fadeIn = showReplaced
    ? interpolate(clampedProgress, [0.5, 0.7], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const fadeOut = showReplaced
    ? 0
    : interpolate(clampedProgress, [0.3, 0.5], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <span style={{ position: "relative", fontFamily: fontFamily.mono, fontSize: 14 }}>
      <span
        style={{
          color: colors.text,
          opacity: showReplaced ? 0 : fadeOut,
        }}
      >
        {value}
      </span>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          color: colors.red400,
          opacity: showReplaced ? fadeIn : 0,
        }}
      >
        {replaced}
      </span>
    </span>
  );
};
