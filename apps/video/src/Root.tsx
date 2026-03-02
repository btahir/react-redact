import { Composition, Still } from "remotion";
import { HeroGif } from "./compositions/HeroGif";
import { LaunchVideo } from "./compositions/LaunchVideo";
import { OgImage } from "./compositions/OgImage";
import { SocialGif } from "./compositions/SocialGif";
import { PHSlide1 } from "./compositions/product-hunt/PHSlide1";
import { PHSlide2 } from "./compositions/product-hunt/PHSlide2";
import { PHSlide3 } from "./compositions/product-hunt/PHSlide3";
import { PHSlide4 } from "./compositions/product-hunt/PHSlide4";
import { PHSlide5 } from "./compositions/product-hunt/PHSlide5";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroGif"
        component={HeroGif}
        durationInFrames={90}
        fps={15}
        width={1660}
        height={930}
      />

      <Composition
        id="LaunchVideo"
        component={LaunchVideo}
        durationInFrames={636}
        fps={30}
        width={1920}
        height={1080}
      />

      <Still id="OgImage" component={OgImage} width={1200} height={675} />

      <Composition
        id="SocialGif"
        component={SocialGif}
        durationInFrames={75}
        fps={15}
        width={1200}
        height={675}
      />

      <Still id="PHSlide1" component={PHSlide1} width={1270} height={760} />
      <Still id="PHSlide2" component={PHSlide2} width={1270} height={760} />
      <Still id="PHSlide3" component={PHSlide3} width={1270} height={760} />
      <Still id="PHSlide4" component={PHSlide4} width={1270} height={760} />
      <Still id="PHSlide5" component={PHSlide5} width={1270} height={760} />
    </>
  );
};
