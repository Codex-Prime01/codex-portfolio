import { useCallback, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import { Intro } from "@/components/site/Intro";
import { Marquee } from "@/components/site/Marquee";
import { StackRecede } from "@/components/motion/StackRecede";

const Index = () => {
  // Flips when the intro veil starts to lift (or straight away if it's skipped).
  const [ready, setReady] = useState(false);
  const onIntroDone = useCallback(() => setReady(true), []);

  return (
    <div className="grain min-h-screen bg-ink">
      <Intro onDone={onIntroDone} />
      <Navigation ready={ready} />
      <main>
        <StackRecede
          pinned={<Hero ready={ready} />}
          over={
            <>
              <Marquee />
              <Projects />
            </>
          }
        />
        <About />
        <Resume />
        <Contact />
      </main>
    </div>
  );
};

export default Index;
