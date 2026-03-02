import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CtaScene } from "../scenes/CtaScene";
import { DemoScene } from "../scenes/DemoScene";
import { HookScene } from "../scenes/HookScene";
import { SolutionScene } from "../scenes/SolutionScene";

export const LaunchVideo: React.FC = () => {
  // 145 + 105 + 390 + 110 = 750 effective frames
  // Minus 3 transitions of 8 frames = -24 overlap
  // ≈ 666 frames = 22.2s
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOutStart = durationInFrames - fps * 2;
  const volume = interpolate(frame, [0, 8, fadeOutStart, durationInFrames], [0, 0.8, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <Audio
        src={staticFile("night_drive.mp3")}
        startFrom={0}
        volume={volume}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={115}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        <TransitionSeries.Sequence durationInFrames={105}>
          <SolutionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        <TransitionSeries.Sequence durationInFrames={390}>
          <DemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        <TransitionSeries.Sequence durationInFrames={110}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
