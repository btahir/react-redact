import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const sora = loadSora("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const jetbrainsMono = loadJetBrainsMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const fontFamily = {
  sora: sora.fontFamily,
  mono: jetbrainsMono.fontFamily,
};
